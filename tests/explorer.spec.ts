import { expect, test, type Page } from "@playwright/test";
import {
  centerlinePoints,
  diffusionCoefficient,
  gaussianConcentration,
  profilePoints,
  transverseDiffusionTime,
} from "../src/lib/particleModel";

test.describe("diffusion model invariants", () => {
  test("Stokes–Einstein uses nm, mPa·s and µm²/s consistently", () => {
    // Independent reference: a 100 nm sphere at 25 °C in 1 mPa·s has
    // D ≈ 4.3676 × 10⁻¹² m²/s, which is 4.3676 µm²/s.
    const reference = diffusionCoefficient(100, 1, 298.15);
    expect(reference).toBeCloseTo(4.3676, 4);
    expect(diffusionCoefficient(200, 1) / reference).toBeCloseTo(0.5, 12);
    expect(diffusionCoefficient(100, 2) / reference).toBeCloseTo(0.5, 12);
    expect(diffusionCoefficient(100, 1, 596.3) / reference).toBeCloseTo(2, 12);
  });

  test("the half-width comparison time has seconds and quadratic length scaling", () => {
    // At D = 2 µm²/s the one-dimensional RMS displacement reaches
    // 10 µm in 25 seconds. This does not assert a channel mixing time.
    expect(transverseDiffusionTime(10, 2)).toBe(25);
    expect(transverseDiffusionTime(20, 2)).toBe(100);
    expect(transverseDiffusionTime(10, 4)).toBe(12.5);
  });

  test("Gaussian diffusion remains finite, conserves mass and broadens over time", () => {
    const D = 4;
    const sigma0 = 12;
    const initialPeak = 1 / (Math.sqrt(2 * Math.PI) * sigma0);
    const times = [0, 300, 1200];
    const moments = times.map((time) => {
      // Integrate far beyond the UI window so mass leaving the visible
      // comparison span is not mistaken for mass lost from the free domain.
      const points = profilePoints(2000, time, D, sigma0, 4001);
      expect(
        points.every(
          (point) =>
            Number.isFinite(point.concentration) && point.concentration >= 0,
        ),
      ).toBe(true);
      let mass = 0;
      let secondMoment = 0;
      for (let index = 0; index < points.length; index++) {
        const point = points[index];
        if (index === 0) continue;
        const previous = points[index - 1];
        const dx = point.x - previous.x;
        mass += (dx * (previous.concentration + point.concentration)) / 2;
        secondMoment +=
          (dx *
            (previous.x ** 2 * previous.concentration +
              point.x ** 2 * point.concentration)) /
          2;
      }
      expect(mass * initialPeak).toBeCloseTo(1, 8);
      expect(gaussianConcentration(-40, time, D)).toBeCloseTo(
        gaussianConcentration(40, time, D),
        12,
      );
      return { variance: secondMoment / mass };
    });

    expect(gaussianConcentration(0, 0, D)).toBe(1);
    expect(moments[0].variance).toBeCloseTo(sigma0 ** 2, 8);
    for (let index = 1; index < times.length; index++) {
      expect(moments[index].variance - moments[0].variance).toBeCloseTo(
        2 * D * times[index],
        6,
      );
      expect(gaussianConcentration(0, times[index], D)).toBeLessThan(
        gaussianConcentration(0, times[index - 1], D),
      );
    }
    const centerline = centerlinePoints(1200, D);
    expect(centerline[0].concentration).toBe(1);
    expect(centerline.at(-1)!.concentration).toBeCloseTo(
      gaussianConcentration(0, 1200, D),
      12,
    );
    expect(
      centerline.every(
        (point, index) =>
          index === 0 ||
          point.concentration < centerline[index - 1].concentration,
      ),
    ).toBe(true);
  });

  test("invalid physical inputs fail rather than generating misleading plots", () => {
    expect(() => diffusionCoefficient(0, 1)).toThrow(RangeError);
    expect(() => diffusionCoefficient(100, Number.NaN)).toThrow(RangeError);
    expect(() => gaussianConcentration(0, -1, 4)).toThrow(RangeError);
    expect(() => profilePoints(400, 300, 4, 12, 1)).toThrow(RangeError);
    expect(() => transverseDiffusionTime(100, 0)).toThrow(RangeError);
  });
});

async function setRange(page: Page, id: string, value: number) {
  const slider = page.locator(`#${id}`);
  await slider.evaluate((element: HTMLInputElement, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await expect(slider).toHaveValue(String(value));
}

async function readPlot(page: Page) {
  return page.locator("#particle-explorer").evaluate((element) => {
    const number = (selector: string) =>
      Number(element.querySelector(selector)!.textContent!.replaceAll(",", ""));
    const attribute = (selector: string, name: string) =>
      element.querySelector(selector)!.getAttribute(name)!;
    return {
      D: number("[data-pe-d]"),
      tau: number("[data-pe-tau]"),
      center: number("[data-pe-center]"),
      profile: attribute("[data-pe-profile]", "d"),
      temporal: attribute("[data-pe-temporal]", "d"),
      leftGuide: Number(attribute("[data-pe-left-guide]", "x1")),
      rightGuide: Number(attribute("[data-pe-right-guide]", "x1")),
      markerX: Number(attribute("[data-pe-time-marker]", "cx")),
    };
  });
}

async function readControls(page: Page) {
  return page
    .locator("[data-pe-controls]")
    .evaluate((element) =>
      Object.fromEntries(
        Array.from(
          element.querySelectorAll<HTMLSelectElement | HTMLInputElement>(
            "select, input",
          ),
        ).map((control) => [control.id, control.value]),
      ),
    );
}

function halfHeightWidth(path: string) {
  const points = Array.from(
    path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g),
    (match) => ({ x: Number(match[1]), y: Number(match[2]) }),
  );
  const peakY = Math.min(...points.map((point) => point.y));
  const baselineY = Math.max(...points.map((point) => point.y));
  const upperHalf = points.filter(
    (point) => point.y <= (peakY + baselineY) / 2,
  );
  return upperHalf.at(-1)!.x - upperHalf[0].x;
}

test.describe("literature observation explorer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#pe-observation")).toBeEnabled();
  });

  test("changing the published record updates its measurements, source and calculated coefficient", async ({
    page,
  }) => {
    await expect(page.locator("#pe-observation")).toHaveValue("fl-pbs");
    await expect(page.locator("[data-pe-size]")).toHaveText("567 ± 102 nm");
    await expect(page.locator("[data-pe-zeta]")).toHaveText("28 ± 4 mV");
    await expect(page.locator("[data-pe-d]")).toHaveText("0.77");
    await page.locator("#pe-observation").selectOption("pei-water");
    await expect(page.locator("[data-pe-size]")).toHaveText("136 ± 25 nm");
    await expect(page.locator("[data-pe-zeta]")).toHaveText("54.4 ± 4 mV");
    await expect(page.locator("[data-pe-source]")).toHaveAttribute(
      "href",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC7589566/#ijms-21-07545-t001",
    );
    await expect(page.locator("[data-pe-uncertainty]")).toContainText(
      "Mean ± SE",
    );
    await expect(page.locator("[data-pe-d]")).toHaveText("3.21");
  });

  test("viscosity changes diffusion while channel width changes only the comparison scale", async ({
    page,
  }) => {
    await page.locator("#pe-viscosity").selectOption("1");
    await setRange(page, "pe-width", 200);
    const original = await readPlot(page);
    await page.locator("#pe-viscosity").selectOption("2");
    const viscous = await readPlot(page);
    expect(viscous.D).toBeCloseTo(original.D / 2, 1);
    expect(viscous.profile).not.toBe(original.profile);
    expect(viscous.temporal).not.toBe(original.temporal);

    await setRange(page, "pe-width", 400);
    const wider = await readPlot(page);
    expect(wider.D).toBe(viscous.D);
    expect(wider.center).toBe(viscous.center);
    expect(wider.profile).toBe(viscous.profile);
    expect(wider.temporal).toBe(viscous.temporal);
    expect(Math.abs(wider.tau - 4 * viscous.tau)).toBeLessThanOrEqual(0.3);
    expect(wider.leftGuide).toBeLessThan(viscous.leftGuide);
    expect(wider.rightGuide).toBeGreaterThan(viscous.rightGuide);
    expect(wider.rightGuide - wider.leftGuide).toBeCloseTo(
      2 * (viscous.rightGuide - viscous.leftGuide),
      5,
    );
  });

  test("elapsed time lowers the fixed-reference peak, broadens the curve and reset restores the example", async ({
    page,
  }) => {
    const defaultControls = await readControls(page);
    const defaultPlot = await readPlot(page);
    await setRange(page, "pe-time", 0);
    const initial = await readPlot(page);
    expect(initial.center).toBe(1);
    await expect(page.locator("[data-pe-profile]")).toHaveAttribute(
      "d",
      (await page.locator("[data-pe-initial]").getAttribute("d"))!,
    );

    await setRange(page, "pe-time", 900);
    const later = await readPlot(page);
    expect(later.center).toBeGreaterThan(0);
    expect(later.center).toBeLessThan(initial.center);
    expect(halfHeightWidth(later.profile)).toBeGreaterThan(
      halfHeightWidth(initial.profile),
    );
    expect(later.D).toBe(initial.D);
    expect(later.temporal).toBe(initial.temporal);
    expect(later.markerX).toBeGreaterThan(initial.markerX);

    await page.locator("#pe-observation").selectOption("pei-mem");
    await page.locator("#pe-viscosity").selectOption("2");
    await setRange(page, "pe-width", 300);
    await page.locator("[data-pe-reset]").click();
    expect(await readControls(page)).toEqual(defaultControls);
    expect(await readPlot(page)).toEqual(defaultPlot);
  });

  test("switching language preserves the selected measurement and model inputs while updating chart descriptions", async ({
    page,
  }) => {
    await page.locator("#pe-observation").selectOption("paa-mem");
    await page.locator("#pe-viscosity").selectOption("0.7");
    await setRange(page, "pe-width", 300);
    await setRange(page, "pe-time", 900);
    const controls = await readControls(page);
    const plot = await readPlot(page);
    await page.getByRole("button", { name: "Switch to Chinese" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    expect(await readControls(page)).toEqual(controls);
    expect(await readPlot(page)).toEqual(plot);
    await expect(page.locator("#pe-width")).toHaveAttribute(
      "aria-valuetext",
      "300 微米",
    );
    await expect(page.locator("#pe-time")).toHaveAttribute(
      "aria-valuetext",
      "900 秒",
    );
    await expect(page.locator("#pe-spatial-description")).toContainText(
      "900 秒",
    );
    await expect(page.locator("#pe-temporal-description")).toContainText(
      "900 秒",
    );
    await expect(page.locator("[data-pe-announcement]")).toContainText(
      "扩散系数",
    );

    await page.getByRole("button", { name: "切换为英文" }).click();
    expect(await readControls(page)).toEqual(controls);
    expect(await readPlot(page)).toEqual(plot);
    await expect(page.locator("#pe-width")).toHaveAttribute(
      "aria-valuetext",
      "300 micrometers",
    );
    await expect(page.locator("#pe-temporal-description")).toContainText(
      "900 seconds",
    );
  });

  test("the elapsed-time slider can be operated with the keyboard", async ({
    page,
  }) => {
    const time = page.locator("#pe-time");
    await time.focus();
    await time.press("Home");
    await expect(time).toHaveValue("0");
    await expect(page.locator("[data-pe-center]")).toHaveText("1.000");
    await time.press("ArrowRight");
    await expect(time).toHaveValue("10");
    await expect(time).toHaveAttribute("aria-valuetext", "10 seconds");
    expect((await readPlot(page)).center).toBeLessThan(1);
  });
});
