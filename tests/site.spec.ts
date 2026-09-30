import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { waitForMotion } from "./helpers";

const pages = [
  {
    path: "platform/",
    name: "Platform",
    heading: /Particles\. Environments\. Time\.\s*One connected view\./,
  },
  {
    path: "explorer/",
    name: "Explorer",
    heading: /Change the conditions\.\s*See the scenario\./,
  },
  {
    path: "experiments/",
    name: "Experiments",
    heading: /From models\s*to measurements\./,
  },
  {
    path: "roadmap/",
    name: "Roadmap",
    heading: /Start with visibility\.\s*Build toward validation\./,
  },
  {
    path: "partners/",
    name: "Partners",
    heading:
      /For the people doing the research\.\s*And the people backing it\./,
  },
  {
    path: "faq/",
    name: "FAQs",
    heading: /Know the model\.\s*See what’s next\./,
  },
] as const;

test("platform home and navigation render without photos, overflow or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(page).toHaveTitle(
    "Fluid Fabs — Particle behavior, made visible.",
  );
  await expect(page.locator("h1")).toHaveText(
    /See how particles move\.\s*Explore what comes next\./,
  );
  await expect(page.locator("img")).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const anchors = await page.locator('a[href*="#"]').evaluateAll((elements) =>
    elements
      .map((element) => new URL(element.getAttribute("href")!, location.href))
      .filter(
        (url) =>
          url.origin === location.origin &&
          url.pathname === location.pathname &&
          url.hash,
      )
      .map((url) => url.hash.slice(1)),
  );
  for (const id of anchors)
    expect(await page.locator(`[id="${id}"]`).count()).toBe(1);
  await expect(page.locator(".page-card")).toHaveCount(5);
  for (const route of [
    "platform",
    "explorer",
    "experiments",
    "roadmap",
    "partners",
  ]) {
    await expect(page.locator(`.page-card[href$="/${route}/"]`)).toHaveCount(1);
    await expect(page.locator(`section#${route}`)).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

for (const destination of pages) {
  test(`${destination.name} supports page navigation, refresh, back and direct loading`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const url = new URL(destination.path, baseURL);
    const title = `${destination.name} — Fluid Fabs`;
    const footerLink = () =>
      page.locator(`.site-footer a[href="${url.pathname}"]`);
    const verifyPage = async () => {
      await expect(page).toHaveURL(url.href);
      await expect(page).toHaveTitle(title);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(destination.heading);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(footerLink()).toHaveAttribute("aria-current", "page");
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        title,
      );
      const currentHeaderLinks = page.locator(
        '.site-header a[aria-current="page"]',
      );
      if (destination.path === "faq/") {
        await expect(currentHeaderLinks).toHaveCount(0);
      } else {
        await expect(currentHeaderLinks).toHaveCount(2);
        for (const link of await currentHeaderLinks.all())
          await expect(link).toHaveAttribute("href", url.pathname);
      }
      await expect(page.locator("img")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (process.env.SITE_URL) {
        const publicURL = new URL(url.pathname, process.env.SITE_URL).href;
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          publicURL,
        );
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
          "content",
          publicURL,
        );
      }
    };

    await page.goto("./");
    const entry =
      destination.path === "faq/"
        ? footerLink()
        : page.locator(`.page-card[href="${url.pathname}"]`);
    await entry.click();
    await verifyPage();
    await page.reload();
    await verifyPage();
    await page.goBack();
    await expect(page).toHaveURL(baseURL!);
    await expect(page.locator(".page-card")).toHaveCount(5);
    const response = await page.goto(url.href);
    expect(response?.status()).toBe(200);
    await verifyPage();
    expect(errors).toEqual([]);
  });
}

test("legacy explorer links resolve to the dedicated page", async ({
  page,
  baseURL,
}) => {
  await page.goto(new URL("#explorer", baseURL).href);
  await expect(page).toHaveURL(new URL("explorer/", baseURL).href);
  await expect(page).toHaveTitle("Explorer — Fluid Fabs");
  await expect(page.locator("#particle-explorer")).toBeVisible();
});

test("FAQ answers expand and privacy page is available", async ({ page }) => {
  await page.goto("faq/");
  const faq = page.locator(".faq-item").first();
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("p")).toBeVisible();
  await expect(faq.locator("p")).toContainText("particle-modeling platform");
  await page.getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Privacy, in plain language.");
});

test("partnership inquiry validates, downloads an accurate brief and restores focus", async ({
  page,
}) => {
  await page.goto("./");
  const trigger = page.locator(".hero-actions [data-project-trigger]");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Connect with Fluid Fabs." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Your name")).toBeFocused();
  await expect(dialog.getByLabel("Interest", { exact: true })).toHaveValue(
    "Biotech pilot",
  );
  await dialog.getByRole("button", { name: "Download brief" }).click();
  expect(
    await dialog
      .locator("form")
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(false);
  await dialog.getByLabel("Your name").fill("Test Researcher");
  await dialog.getByLabel("Email address").fill("researcher@example.com");
  await dialog.getByLabel("Organization").fill("Example Lab");
  await dialog
    .getByLabel("Interest", { exact: true })
    .selectOption("Research partnership");
  const context =
    "Compare particle diffusion across two solution conditions in a research pilot.";
  await dialog.getByLabel("What would you like to explore?").fill(context);
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download brief" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("fluid-fabs-project-brief.txt");
  const text = await readFile((await download.path())!, "utf8");
  expect(text).toContain("Name: Test Researcher");
  expect(text).toContain("Interest: Research partnership");
  expect(text).toContain(context);
  expect(text).toContain("Particle behavior, made visible.");
  expect(text).toContain("Contact: danielzhong2000@gmail.com");
  await expect(dialog.getByRole("status")).toContainText("ready to download");
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("partner actions select the right intent, retain entries and allow update requests without context", async ({
  page,
}) => {
  await page.goto("partners/");
  const dialog = page.locator("#project-dialog");
  await page
    .locator('#partners [data-project-interest="Biotech pilot"]')
    .click();
  await dialog.getByLabel("Your name").fill("Alex Chen");
  await dialog.getByLabel("Email address").fill("alex@example.com");
  await dialog.getByLabel("Organization").fill("Example Biotech");
  await page.keyboard.press("Escape");

  for (const interest of ["Investor walkthrough", "Product updates"]) {
    await page
      .locator(`#partners [data-project-interest="${interest}"]`)
      .click();
    await expect(dialog.getByLabel("Interest", { exact: true })).toHaveValue(
      interest,
    );
    await expect(dialog.getByLabel("Your name")).toHaveValue("Alex Chen");
    await expect(dialog.getByLabel("Email address")).toHaveValue(
      "alex@example.com",
    );
    await expect(dialog.getByLabel("Organization")).toHaveValue(
      "Example Biotech",
    );
    if (interest === "Investor walkthrough")
      await page.keyboard.press("Escape");
  }

  await expect(
    dialog.getByLabel("What would you like to explore?"),
  ).toBeEmpty();
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download brief" }).click();
  const download = await downloadEvent;
  const brief = await readFile((await download.path())!, "utf8");
  expect(brief).toContain("Interest: Product updates");
  expect(brief).toContain("CONTEXT AND GOALS\nNot provided");
  await expect(dialog.getByRole("status")).toContainText("Email the file");
});

test("mobile navigation opens, closes and restores keyboard focus", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation only");
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Platform", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(nav).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await nav.getByRole("button", { name: "Explore a pilot" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.locator('#project-dialog select[name="application"]'),
  ).toHaveValue("Biotech pilot");
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await nav.getByRole("link", { name: "Platform", exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/$/);
  await expect(nav).not.toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveText(
    "Platform",
  );
});

test("page and partnership dialog meet automated accessibility checks", async ({
  page,
}) => {
  await page.goto("./");
  const scan = async () => {
    await waitForMotion(page);
    return new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
  };
  expect((await scan()).violations).toEqual([]);
  await page.locator(".hero-actions [data-project-trigger]").click();
  expect((await scan()).violations).toEqual([]);
});

test("deployment base keeps navigation, assets and sharing URLs intact", async ({
  page,
  request,
  baseURL,
}) => {
  const deploymentPath = new URL(baseURL!).pathname;
  await page.goto("./");

  const publicURLs = await page
    .locator('script[src], link[rel="stylesheet"], link[rel="icon"]')
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          element.getAttribute("src") || element.getAttribute("href")!,
      ),
    );
  for (const value of new Set(publicURLs)) {
    const url = new URL(value, baseURL);
    expect(url.pathname.startsWith(deploymentPath)).toBe(true);
    expect(
      (await request.get(url.href)).ok(),
      `Asset is available: ${value}`,
    ).toBe(true);
  }

  const localLinks = await page
    .locator('a[href^="/"]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")!),
    );
  for (const href of localLinks)
    expect(href.startsWith(deploymentPath)).toBe(true);

  if (process.env.SITE_URL) {
    const publicHome = new URL(deploymentPath, process.env.SITE_URL).href;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      publicHome,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      publicHome,
    );
  }

  await page.getByRole("link", { name: "Privacy", exact: true }).click();
  expect(new URL(page.url()).pathname).toBe(`${deploymentPath}privacy/`);
  await expect(
    page.getByRole("link", { name: "← Back to Fluid Fabs" }),
  ).toHaveAttribute("href", deploymentPath);
  if (process.env.SITE_URL) {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new URL(`${deploymentPath}privacy/`, process.env.SITE_URL).href,
    );
  }

  await page.goto("404.html");
  await expect(page.locator("h1")).toContainText("Let’s get back");
  await page.getByRole("link", { name: "Back to Fluid Fabs →" }).click();
  expect(new URL(page.url()).pathname).toBe(deploymentPath);
});
