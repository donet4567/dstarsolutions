import { expect, test } from "@playwright/test";

test("reduced motion keeps the full customer journey readable without pinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#top canvas")).toHaveCount(0);
  await expect(page.locator(".simple-process-grid li")).toHaveCount(4);
  await page.getByRole("region", { name: "Great ideas deserve to become something real." }).scrollIntoViewIfNeeded();
  await expect(page.locator("#founder-title")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
});
