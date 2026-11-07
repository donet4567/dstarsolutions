import { expect, test } from "@playwright/test";

test("gallery controls reveal composition and detail without demo links", async ({ page }) => {
  await page.goto("/");
  const controls = page.getByRole("group", { name: "Website preview size" });
  for (const [name, detail] of [["Detail crop", "true"], ["Full composition", "false"]]) {
    await controls.getByRole("button", { name, exact: true }).click();
    await expect(controls.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".gallery-image-stage").first()).toHaveAttribute("data-detail", detail);
  }
  await expect(page.locator('.business-card a[href^="/website-demos/"]')).toHaveCount(0);
});

test("clean navigation and hero fit all requested widths", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    const header = await page.locator("header").boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
