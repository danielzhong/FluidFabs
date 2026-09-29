import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

function parseCsv(value: string): string[][] {
  const text = value.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index++;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && text[index + 1] === "\n") index++;
    } else field += char;
  }
  if (field || row.length) rows.push([...row, field]);
  if (quoted) throw new Error("Unclosed quoted CSV field");
  return rows;
}

test("published measurements filter by particle and zeta range and preserve selection across languages", async ({
  page,
}) => {
  await page.goto("./");
  const evidence = page.locator("#literature");
  const system = evidence.locator("#lit-system");
  const range = evidence.locator("#lit-range");
  const visible = evidence.locator("[data-lit-record]:visible");
  await expect(system).toBeEnabled();
  await expect(system).toHaveValue("fl");
  await expect(visible).toHaveCount(4);
  await expect(evidence.locator('[data-lit-record="fl-pb"]')).toContainText(
    "+36 ± 6",
  );
  await expect(
    evidence.locator('[data-lit-record="fl-glucose30"]'),
  ).toContainText("+72 ± 3");

  await system.selectOption("pei");
  await expect(visible).toHaveCount(2);
  await expect(evidence.locator('[data-lit-record="pei-water"]')).toContainText(
    "+54.4 ± 4",
  );
  await expect(evidence.locator('[data-lit-record="pei-mem"]')).toContainText(
    "−3 ± 1",
  );
  await range.selectOption("negative");
  await expect(visible).toHaveCount(0);
  await expect(evidence.locator("[data-lit-empty]")).toBeVisible();
  await expect(evidence.locator("[data-lit-status]")).toHaveText(
    "0 published observations shown.",
  );

  await range.selectOption("near-neutral");
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute("data-lit-record", "pei-mem");
  await page.getByRole("button", { name: "Switch to Chinese" }).click();
  await expect(system).toHaveValue("pei");
  await expect(range).toHaveValue("near-neutral");
  await expect(visible).toHaveCount(1);
  await expect(visible).toContainText("胎牛血清");
  await expect(evidence.locator("[data-lit-status]")).toHaveText(
    "显示 1 条文献观测。",
  );
  await page.getByRole("button", { name: "切换为英文" }).click();
  await expect(system).toHaveValue("pei");
  await expect(range).toHaveValue("near-neutral");
  await expect(visible).toContainText("MEM α + 2% FCS");
});

test("expanded literature table retains source-specific measurements and uncertainty definitions", async ({
  page,
}) => {
  await page.goto("./");
  const evidence = page.locator("#literature");
  await evidence
    .getByLabel("Particle system", { exact: true })
    .selectOption("pei");
  const magneticContext = evidence.locator('[data-lit-context="pei"]');
  await expect(magneticContext).toContainText("Mean ± SE");
  await expect(magneticContext).not.toContainText(/\bSD\b/);
  await expect(magneticContext).toContainText("n unreported");
  await evidence.locator(".lit-records summary").click();
  const records = evidence.locator("[data-literature-row]");
  await expect(records).toHaveCount(12);
  const peiWater = evidence.locator('[data-literature-row="pei-water"]');
  await expect(peiWater).toContainText("+54.4 ± 4");
  await expect(peiWater).toContainText("136 ± 25");
  await expect(peiWater).toContainText("DLS Z-average");
  await expect(peiWater.locator("td").nth(3)).toHaveText("6.6");
  await expect(peiWater.getByRole("link")).toHaveAttribute(
    "href",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC7589566/#ijms-21-07545-t001",
  );
  const peiMem = evidence.locator('[data-literature-row="pei-mem"]');
  await expect(peiMem).toContainText("1352 ± 273");
  await expect(peiMem.locator("td").nth(3)).toHaveText("Not reported");
  const flPbs = evidence.locator('[data-literature-row="fl-pbs"]');
  await expect(flPbs).toContainText("+28 ± 4");
  await expect(flPbs).toContainText("567 ± 102");
  await expect(flPbs).toContainText("DLS mean peak");
  await expect(flPbs.locator("td").nth(3)).toHaveText("7.4");
  await expect(evidence.locator(".lit-table-note")).toContainText(
    "not a reported experimental condition",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("CSV download and JSON preserve all 12 published records, sources and missing conditions", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("./");
  const downloadEvent = page.waitForEvent("download");
  const link = page.getByRole("link", { name: "Download data CSV" });
  await expect(link).toHaveAttribute(
    "href",
    `${new URL(baseURL!).pathname}data/particle-observations.csv`,
  );
  await link.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("fluid-fabs-literature.csv");
  const csv = await readFile((await download.path())!, "utf8");
  const [headers, ...values] = parseCsv(csv);
  expect(values).toHaveLength(12);
  expect(new Set(headers).size).toBe(headers.length);
  for (const row of values) expect(row).toHaveLength(headers.length);
  const records = values.map((row) =>
    Object.fromEntries(headers.map((key, index) => [key, row[index]])),
  );
  expect(new Set(records.map((row) => row.id)).size).toBe(12);
  expect(new Set(records.map((row) => row.doi)).size).toBe(2);
  for (const row of records) expect(row.temperatureC).toBe("");
  const water = records.find((row) => row.id === "pei-water")!;
  expect(water.zetaMv).toBe("54.4");
  expect(water.zetaSpreadMv).toBe("4");
  expect(water.diameterNm).toBe("136");
  expect(water.ph).toBe("6.6");
  expect(water.sampleCount).toBe("");
  expect(water.uncertaintyLabel).toContain("Mean ± SE");
  expect(water.uncertaintyLabel).not.toMatch(/\bSD\b/);
  expect(water.sourceUrl).toBe(
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC7589566/#ijms-21-07545-t001",
  );
  const mem = records.find((row) => row.id === "pei-mem")!;
  expect(mem.zetaMv).toBe("-3");
  expect(mem.diameterNm).toBe("1352");
  expect(mem.ph).toBe("");
  expect(mem.note).toContain("stable fraction");
  const fl = records.find((row) => row.id === "fl-pb")!;
  expect(fl.formulation).toBe("DOPE/DOTAP/TFPE-head, 1/1/0.1 mol/mol");
  expect(fl.uncertaintyLabel).toBe("Mean ± SD; n = 3");
  expect(fl.sampleCount).toBe("3");

  const response = await request.get(
    new URL("data/particle-observations.json", baseURL).href,
  );
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.observations).toHaveLength(12);
  expect(Object.keys(data.sources)).toHaveLength(2);
  for (const observation of data.observations) {
    expect(observation.temperatureC).toBeNull();
    if (observation.sourceId === "skocaj2020") {
      expect(observation.sampleCount).toBeNull();
      expect(observation.uncertaintyLabel).toContain("Mean ± SE");
    }
  }
  expect(data.sources.skocaj2020.doi).toBe("10.3390/ijms21207545");
  expect(data.sources.kolasinac2019.doi).toBe("10.3390/nano9071025");
});
