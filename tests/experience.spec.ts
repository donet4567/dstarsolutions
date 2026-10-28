import { expect, test } from "@playwright/test";

test("service demos switch viewport and update dashboard state", async ({ page }) => {
  await page.goto("/");
  const sizes = page.getByRole("group", { name: "Website preview size" });
  await sizes.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect(sizes.getByRole("button", { name: "Mobile", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Mobile website concept preview", { exact: true })).toBeVisible();
  await sizes.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect(page.getByLabel("Desktop website concept preview", { exact: true })).toBeVisible();
  const task = page.getByRole("checkbox", { name: /Bring it to life/ });
  await task.check();
  await expect(task).toBeChecked();
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: "3 / 3" })).toBeVisible();
  await task.uncheck();
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: "2 / 3" })).toBeVisible();
});

test("bloom loads, can be paused and keeps a readable composition", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#top")).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
  await expect(page.locator("#top canvas")).toBeVisible();
  await page.getByRole("button", { name: "Rotate bloom right" }).click();
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume animation", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Rotate bloom right" })).toBeDisabled();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator("#top")).not.toContainText("Everything, in flow.");
  await expect(page.locator("#top")).not.toContainText("Make an impression.");
  await expect(page.getByTestId("hero-interface")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("hero.png") });
  await page.getByRole("button", { name: "Resume animation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rotate bloom right" })).toBeEnabled();
});

test("reduced motion removes the pinned journey and autonomous animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause animation", exact: true })).toBeDisabled();
  const stage = page.locator("#top > div").first();
  await expect(stage).toHaveCSS("position", "relative");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
});

test("layout stays inside small phones and desktop viewports", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator("#services").scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Let’s build your website" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});

test("a missing WebGL renderer retains the illustrated hero and enquiry", async ({ page }) => {
  await page.addInitScript(() => {
    // Exercise the main-thread compatibility renderer as well as failed WebGL.
    Object.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen", { value: undefined, configurable: true });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /interactive pastel bloom/ })).toBeVisible();
  await page.getByRole("button", { name: "Start your project", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
