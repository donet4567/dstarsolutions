import { expect, test } from "@playwright/test";

test("the 3D journey follows ordered chapters on desktop and mobile", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const journey = page.locator("#digital-journey");
  await journey.scrollIntoViewIfNeeded();
  await expect(journey).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await expect(journey).toHaveAttribute("data-enhanced", "true");
  const navigation = page.getByRole("navigation", { name: "Digital journey chapters" });
  await navigation.getByRole("button", { name: /Shape/ }).click();
  await expect(journey).toHaveAttribute("data-chapter", "1");
  await expect(journey.getByRole("heading", { name: "Give the idea a point of view." })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("dimension.png") });
  await navigation.getByRole("button", { name: /Connect/ }).click();
  await expect(journey).toHaveAttribute("data-chapter", "2");
  await expect(journey.getByRole("heading", { name: "Make every part work together." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("reduced motion keeps the 3D story and process in a readable layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const journey = page.locator("#digital-journey");
  await journey.scrollIntoViewIfNeeded();
  await expect(journey).toHaveAttribute("data-enhanced", "false");
  await expect(journey.locator(":scope > div")).toHaveCSS("position", "relative");
  await page.getByRole("navigation", { name: "Digital journey chapters" }).getByRole("button", { name: /Connect/ }).click();
  await expect(journey).toHaveAttribute("data-chapter", "2");
  await expect(page.locator(".process-step")).toHaveCount(4);
  for (const card of await page.locator(".process-step").all()) await expect(card).toHaveCSS("position", "relative");
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
  await gallery.getByRole("button", { name: "Preview HireVify", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "HireVify", exact: true })).toBeVisible();
});
