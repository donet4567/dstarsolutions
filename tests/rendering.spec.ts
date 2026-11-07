import { expect, test } from "@playwright/test";

test("editorial hero is crawlable and reduced motion retains a static sculpture", async ({ page, request }) => {
  const response = await request.get("/");
  expect(await response.text()).toContain("Small studio.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#top")).not.toContainText("₹8,000");
  await expect(page.locator(".orbit-sculpture canvas")).toHaveCount(0);
  await expect(page.locator(".orbit-fallback")).toBeVisible();
});
