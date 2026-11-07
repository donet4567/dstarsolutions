import { expect, test } from "@playwright/test";

test("the package landing page contains the complete customer journey", async ({ page }) => {
  await page.goto("/small-business-websites");
  await expect(page).toHaveTitle(/Small Business Websites from ₹8,000/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.dstarsolutions.in/small-business-websites");
  await expect(page.locator("#top")).not.toContainText("₹8,000");
  await expect(page.locator(".price-card")).toHaveCount(3);
  await expect(page.locator(".business-card")).toHaveCount(6);
  await expect(page.locator(".simple-process-grid li")).toHaveCount(4);
  await expect(page.locator(".faq-list details")).toHaveCount(8);
  await expect(page.locator(".pricing-disclosure")).toContainText("no customer database, login, admin dashboard or online checkout");
});

test("reduced motion keeps packages and the four steps readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#packages").scrollIntoViewIfNeeded();
  await expect(page.locator(".price-card").first()).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".simple-process-grid li")).toHaveCount(4);
  for (const card of await page.locator(".simple-process-grid li").all()) await expect(card).not.toHaveCSS("position", "sticky");
});

test("project gallery presents all three previews in document order", async ({ page }) => {
  await page.goto("/");
  const gallery = page.locator("#selected-work");
  await gallery.scrollIntoViewIfNeeded();
  const images = gallery.locator("picture img");
  await expect(images).toHaveCount(3);
  await expect(images.nth(0)).toHaveAttribute("alt", /Mecardee Rental Management/);
  await expect(images.nth(1)).toHaveAttribute("alt", /Mecardee Manager/);
  await expect(images.nth(2)).toHaveAttribute("alt", /HireVify/);
  await gallery.getByRole("button", { name: /HireVify Recruitment/ }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "HireVify", exact: true })).toBeVisible();
});
