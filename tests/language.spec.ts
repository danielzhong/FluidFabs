import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { waitForMotion } from "./helpers";

test("language switches in place and persists independently of the theme across pages", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const faq = page.locator(".faq-item").first();
  await faq.locator("summary").click();
  await page.evaluate(() => {
    document.body.dataset.navigationMarker = "same-page";
  });
  await page.getByRole("button", { name: "Switch to Chinese" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("body")).toHaveAttribute(
    "data-navigation-marker",
    "same-page",
  );
  await expect(page.locator("h1")).toHaveText(
    /看见颗粒的变化。\s*找到下一步方向。/,
  );
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("summary")).toContainText("正在开发什么");
  await page.getByRole("button", { name: "切换为浅色模式" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "隐私说明", exact: true }).click();
  await expect(page).toHaveTitle("隐私说明 — Fluid Fabs");
  await expect(page.locator("h1")).toHaveText("关于隐私，说清楚。");
  await page.getByRole("button", { name: "切换为英文" }).click();
  await expect(page).toHaveTitle("Privacy — Fluid Fabs");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("switching language retains inquiry entries and downloads the selected intent in Chinese", async ({
  page,
}) => {
  await page.goto("./");
  const trigger = page.locator(
    '#partners [data-project-interest="Investor walkthrough"]',
  );
  await trigger.click();
  const dialog = page.locator("#project-dialog");
  await dialog.getByLabel("Your name").fill("陈晓");
  await dialog.getByLabel("Email address").fill("researcher@example.com");
  await dialog.getByLabel("Organization").fill("研究合作团队");
  const goals = "我们希望了解颗粒模型的文献数据来源和下一阶段的实验验证计划。";
  await dialog.getByLabel("What would you like to explore?").fill(goals);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Switch to Chinese" }).click();
  await trigger.click();
  await expect(dialog.getByLabel("姓名")).toHaveValue("陈晓");
  await expect(dialog.getByLabel("邮箱")).toHaveValue("researcher@example.com");
  await expect(dialog.getByLabel("机构")).toHaveValue("研究合作团队");
  await expect(dialog.getByLabel("感兴趣的方向")).toHaveValue(
    "Investor walkthrough",
  );
  await expect(dialog.getByLabel("你希望探索什么？")).toHaveValue(goals);
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "下载咨询简介" }).click();
  const download = await downloadEvent;
  const brief = await readFile((await download.path())!, "utf8");
  expect(brief).toContain("姓名：陈晓");
  expect(brief).toContain("感兴趣的方向：投资方演示");
  expect(brief).toContain(goals);
  expect(brief).toContain("让颗粒行为清晰可见。");
  await expect(dialog.getByRole("status")).toContainText("下载");
});

test("language changes from another tab retain an open inquiry and its selected interest", async ({
  page,
  context,
  baseURL,
}) => {
  await page.goto("./");
  await page.locator(".hero-actions [data-project-trigger]").click();
  const dialog = page.locator("#project-dialog");
  await dialog.getByLabel("Your name").fill("Alex Chen");
  await dialog.getByLabel("Email address").fill("alex@example.com");
  await dialog
    .getByLabel("Interest", { exact: true })
    .selectOption("Product updates");
  const other = await context.newPage();
  await other.goto(baseURL!);
  await other.getByRole("button", { name: "Switch to Chinese" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("姓名")).toHaveValue("Alex Chen");
  await expect(dialog.getByLabel("邮箱")).toHaveValue("alex@example.com");
  await expect(dialog.getByLabel("感兴趣的方向")).toHaveValue(
    "Product updates",
  );
  await expect(
    dialog.getByRole("button", { name: "关闭合作咨询" }),
  ).toBeVisible();
  await other.getByRole("button", { name: "切换为英文" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(dialog.getByLabel("Interest", { exact: true })).toHaveValue(
    "Product updates",
  );
  await expect(dialog.getByLabel("Your name")).toHaveValue("Alex Chen");
  await other.close();
});

test("language controls work when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to Chinese" }).click();
  await expect(page.locator("h1")).toContainText("看见颗粒的变化。");
  await page.getByRole("button", { name: "切换为英文" }).click();
  await expect(page.locator("h1")).toContainText("See how particles move.");
  expect(errors).toEqual([]);
});

test("Chinese page, inquiry and light theme meet accessibility checks without overflow", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to Chinese" }).click();
  const scan = async () => {
    await waitForMotion(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  };
  await scan();
  await page.locator(".hero-actions [data-project-trigger]").click();
  await scan();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "切换为浅色模式" }).click();
  await scan();
});
