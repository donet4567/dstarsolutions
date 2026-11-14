import { expect, test } from "@playwright/test";

test("category, origin and mobile preview survive demo navigation and browser history", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/small-business-websites"]) {
    await page.goto(path);
    const filters = page.getByRole("group", { name: "Filter website examples" });
    await filters.getByRole("button", { name: "Salon", exact: true }).click();
    await expect(page.locator(".business-card")).toHaveCount(1);
    await expect(page.locator(".business-card h3")).toContainText("Studio Aura");
    await filters.getByRole("button", { name: "Café", exact: true }).click();
    await page.goBack();
    await expect(filters.getByRole("button", { name: "Salon", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("link", { name: "View Demo", exact: true }).click();
    await expect(page.locator("h1")).toContainText("A little time.");
    const frame = page.locator(".showroom-stage");
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect(frame).toHaveAttribute("data-viewport", "mobile");
    expect((await frame.boundingBox())!.width).toBeLessThanOrEqual(390);
    await page.getByRole("link", { name: /Next Demo/ }).click();
    await expect(page.locator("h1")).toContainText("Spaces made to last.");
    await expect(frame).toHaveAttribute("data-viewport", "mobile");
    await page.getByRole("link", { name: "Back to Examples", exact: false }).click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/" : path}\\?category=salons-beauty#business-websites$`));
    await expect(page.locator(".business-card")).toHaveCount(1);
    await expect(page.locator(".business-card h3")).toContainText("Studio Aura");
    await filters.getByRole("button", { name: /All studies/ }).click();
    await page.getByRole("link", { name: "View Demo", exact: true }).first().click();
    await page.getByRole("link", { name: "Back to Examples", exact: false }).click();
    await expect(page.locator(".business-card")).toHaveCount(6);
  }
});

test("all concepts preserve original images, accessible interactions and responsive geometry", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const slugs = ["restaurants-cafes", "salons-beauty", "construction", "boutiques-shops", "travel-homestays", "professional-services"];
  for (const slug of slugs) {
    await page.goto(`/website-demos/${slug}`);
    await expect(page.locator(".concept-site-hero img")).toHaveJSProperty("complete", true);
    expect(await page.locator(".concept-site-hero img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".showroom-caption")).toContainText("FICTIONAL BUSINESS");
    const tabs = page.getByRole("tab");
    if (await tabs.count()) {
      await tabs.first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
    }
    if (slug === "salons-beauty") {
      await page.locator(".ritual-list summary").nth(1).click();
      await expect(page.locator(".ritual-list details").nth(1)).toHaveAttribute("open", "");
    }
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} / ${width}px`).toBeTruthy();
    }
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect(page.locator(".showroom-stage")).toHaveAttribute("data-viewport", "mobile");
    await page.getByRole("button", { name: "Desktop", exact: true }).click();
    await expect(page.locator(".showroom-stage")).toHaveAttribute("data-viewport", "desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (slug === "restaurants-cafes" || slug === "construction") await page.screenshot({ path: testInfo.outputPath(`${slug}-desktop.png`), fullPage:true });
    await page.setViewportSize({ width:390, height:900 });
    if (slug === "restaurants-cafes" || slug === "salons-beauty") await page.screenshot({ path: testInfo.outputPath(`${slug}-mobile.png`), fullPage:true });
  }
  expect(errors).toEqual([]);
});

test("custom application section is text only and theme remains usable in the showroom", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#custom-applications .custom-apps-art, #custom-applications img")).toHaveCount(0);
  await expect(page.locator("#custom-applications")).toContainText("quoted separately");
  await page.goto("/website-demos/travel-homestays");
  await page.getByRole("button", { name: "Switch to light theme", exact:true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivory");
  await page.getByRole("link", { name: /Next Demo/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivory");
});
