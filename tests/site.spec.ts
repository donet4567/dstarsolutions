import { expect, test } from "@playwright/test";

test("brand, business metadata and crawlable routes are consistent", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/D Star IT Solutions/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Built different.");
  await expect(page.locator("footer address")).toContainText("Bharananganam, Pala");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/www\.dstarsolutions\.in\/?$/);
  const business = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(business.name).toBe("D Star IT Solutions");
  expect(business["@type"]).toBe("LocalBusiness");
  expect(business.telephone).toBe("+917558920076");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("https://www.dstarsolutions.in/");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://www.dstarsolutions.in/sitemap.xml");
  const manifest = await request.get("/manifest.webmanifest");
  expect((await manifest.json()).name).toBe("D Star IT Solutions");
  expect(errors).toEqual([]);
});

test("static content is usable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Selected work." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Talk to us on WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa.me\//);
  await context.close();
});

test("project artwork loads on interaction and gallery supports keyboard navigation", async ({ page }) => {
  const artwork: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/selected-work/")) artwork.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(artwork).toHaveLength(0);
  const trigger = page.getByRole("button", { name: /Mecardee Rental Management Automotive/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Mecardee Rental Management", exact: true })).toBeVisible();
  await expect(dialog.locator("img")).toBeVisible();
  await expect.poll(() => artwork.length).toBeGreaterThan(0);
  await dialog.getByRole("button", { name: "Expand image", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Fit view", exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("heading", { name: "Mecardee Manager", exact: true })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByRole("heading", { name: "Mecardee Rental Management", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("service enquiries preserve project type and prepare the WhatsApp brief", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Let’s simplify your workflow" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: "Web application", exact: true })).toBeChecked();
  await dialog.getByRole("textbox", { name: "A little about your idea" }).fill("A rental booking application");
  // Inspect the prepared URL without opening WhatsApp or sending a message.
  await page.evaluate(() => { window.open = (url) => { document.documentElement.dataset.preparedBrief = String(url); return null; }; });
  await dialog.getByRole("button", { name: "Continue on WhatsApp" }).click();
  const prepared = await page.locator("html").getAttribute("data-prepared-brief");
  const url = new URL(prepared!);
  expect(url.hostname).toBe("wa.me");
  expect(url.pathname).toBe("/917558920076");
  expect(url.searchParams.get("text")).toContain("Project type: Web application");
  expect(url.searchParams.get("text")).toContain("A rental booking application");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("refresh returns to the top and removes the section hash", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Selected work", exact: true }).click();
  await expect(page).toHaveURL(/#selected-work$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.reload();
  await expect(page).toHaveURL(/:3100\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
});

test("navigation adapts without horizontal overflow", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.click();
    const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(navigation).toBeVisible();
    await navigation.getByRole("link", { name: "Our process" }).click();
    await expect(navigation).not.toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await navigation.getByRole("button", { name: "Start a project" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
  } else {
    await expect(page.getByRole("navigation", { name: "Main navigation", exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("performance endpoint validates and bounds incoming measurements", async ({ request, baseURL }) => {
  const valid = await request.post("/api/vitals", { headers: { origin: baseURL! }, data: { name: "LCP", value: 1200, rating: "good", id: "test-1" } });
  expect(valid.status()).toBe(204);
  const invalid = await request.post("/api/vitals", { data: { name: "unknown", value: "wrong" } });
  expect(invalid.status()).toBe(400);
  const oversized = await request.post("/api/vitals", { data: "x".repeat(2000) });
  expect(oversized.status()).toBe(413);
  const foreign = await request.post("/api/vitals", { headers: { origin: "https://example.org" }, data: {} });
  expect(foreign.status()).toBe(403);
});

test("production browser reports real performance measurements", async ({ page }) => {
  const report = page.waitForResponse((response) => response.url().endsWith("/api/vitals"));
  await page.goto("/");
  const response = await report;
  expect(response.status()).toBe(204);
  expect(Object.keys(response.request().postDataJSON()).sort()).toEqual(["id", "name", "rating", "value"]);
});
