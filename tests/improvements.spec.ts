import { expect, test } from "@playwright/test";

test("new appearance control lives in the footer and persists two readable themes", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivory");
  await expect(page.locator("header").getByRole("button", { name: /Switch to .* theme/ })).toHaveCount(0);
  for (const [current, next] of [["ivory", "dark"], ["midnight", "light"]]) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: testInfo.outputPath(`${current}-home.png`) });
    await page.locator("#packages").screenshot({ path: testInfo.outputPath(`${current}-packages.png`) });
    const toggle = page.locator("footer").getByRole("button", { name: `Switch to ${next} theme`, exact: true });
    await toggle.click();
    const expected = next === "light" ? "ivory" : "midnight";
    await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
    expect(await page.evaluate(() => localStorage.getItem("dstar-appearance-v1"))).toBe(expected);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
  }
});

test("blocked storage retains usable default appearance", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } }));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivory");
  await page.locator("footer").getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
});
