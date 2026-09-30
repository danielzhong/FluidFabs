import { test, expect } from "@playwright/test";

test("scroll entrances settle, do not replay, and the reading indicator follows the page", async ({
  page,
}) => {
  await page.goto("./");
  const card = page.locator(".page-card").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      card.evaluate(
        (element) =>
          element
            .getAnimations()
            .filter(
              (a) =>
                a instanceof Animation &&
                a.effect instanceof KeyframeEffect &&
                a.effect.getKeyframes().some((frame) => "opacity" in frame),
            ).length,
      ),
    )
    .toBe(0);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".reading-progress")
        .evaluate((element) =>
          Number(
            (element as HTMLElement).style.getPropertyValue(
              "--reading-progress",
            ),
          ),
        ),
    )
    .toBeGreaterThan(0.95);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  expect(
    await card.evaluate((element) =>
      element
        .getAnimations()
        .some(
          (a) =>
            a.effect instanceof KeyframeEffect &&
            a.effect.getKeyframes().some((frame) => "opacity" in frame),
        ),
    ),
  ).toBe(false);
});

test("reduced motion keeps all content visible and cancels effects when the preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".page-card").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.playState === "running" || animation.pending,
            ).length,
      ),
    )
    .toBe(0);
  await page.locator(".page-card").last().scrollIntoViewIfNeeded();
  await expect(page.locator(".page-card").last()).toHaveCSS("opacity", "1");
  await page.reload();
  await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-halo")).toHaveCSS("animation-name", "none");
  const trigger = page.locator(".hero-actions [data-project-trigger]");
  await trigger.click();
  await expect(page.locator("#project-dialog")).toBeVisible();
  await expect(page.locator("#project-dialog")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("the concept, default charts, and model assumptions remain readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(new URL("explorer/", baseURL).href);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#explorer")).toBeVisible();
  await expect(page.locator("#explorer svg").first()).toBeVisible();
  await expect(page.locator("#roadmap")).toHaveCount(0);
  await expect(page.locator("#literature")).toContainText("+36 ± 6");
  const methods = page.locator(".pe-methods");
  await methods.locator("summary").click();
  await expect(methods).toHaveAttribute("open", "");
  await expect(methods).toContainText("Stokes–Einstein");
  await expect(page.locator("img")).toHaveCount(0);
  await context.close();
});
