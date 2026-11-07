import { expect, test } from "@playwright/test";

test("package prices, limits and WhatsApp selections are correct on both pages", async ({ page }, testInfo) => {
  for (const path of ["/", "/small-business-websites"]) {
    await page.goto(path);
    for (const [name, price, pages, revisions] of [["Business Essential", "₹8,000", "Up to 3 pages", "One revision round"], ["Business Growth", "₹15,000", "Up to 5 pages total", "Two revision rounds"], ["Business Premium", "₹25,000", "Up to 8 pages total", "Three revision rounds"]]) {
      const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });
      await expect(card.locator(".plan-price")).toContainText(price);
      await expect(card).toContainText(pages);
      await expect(card).toContainText(revisions);
      const url = new URL((await card.getByRole("link", { name: `Choose This Package: ${name}`, exact: true }).getAttribute("href"))!);
      expect(url.origin).toBe("https://wa.me");
      expect(url.pathname).toBe("/917558920076");
      expect(url.searchParams.get("text")).toContain(`${name} website package, starting at ${price}`);
      expect(url.searchParams.get("text")).toContain("domain and hosting charges are additional");
    }
    await expect(page.locator(".price-card").nth(1)).toContainText("without online checkout");
    await expect(page.locator(".price-card").nth(2)).toContainText("client-supplied translations");
    await expect(page.locator(".pricing-disclosure")).toContainText("renewals");
    await expect(page.locator(".pricing-disclosure")).toContainText("paid third-party services");
    if (path === "/") await page.screenshot({ path: testInfo.outputPath("homepage.png") });
  }
});

test("enquiry validates fields and preserves Unicode, punctuation and package selection", async ({ page }) => {
  await page.goto("/");
  await page.locator("header").getByRole("button", { name: "Let’s talk", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => { window.open = (url) => { document.documentElement.dataset.preparedBrief = String(url); return null; }; });
  await dialog.getByRole("button", { name: "Continue on WhatsApp" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-prepared-brief");
  await dialog.getByRole("textbox", { name: "Your name", exact: true }).fill("Anu & Joseph");
  await dialog.getByRole("textbox", { name: "Business name", exact: true }).fill("കഫേ + Co.");
  await dialog.getByRole("combobox", { name: "Business category" }).selectOption("Restaurants & cafés");
  await dialog.getByRole("combobox", { name: "Package of interest" }).selectOption({ label: "Business Growth — ₹15,000" });
  await dialog.getByRole("textbox", { name: "Short project requirement" }).fill("Menu & gallery? Malayalam + English, 50% photos supplied.");
  await dialog.getByRole("button", { name: "Continue on WhatsApp" }).click();
  const url = new URL((await page.locator("html").getAttribute("data-prepared-brief"))!);
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe("/917558920076");
  const message = url.searchParams.get("text");
  for (const detail of ["Anu & Joseph", "കഫേ + Co.", "Restaurants & cafés", "Business Growth — ₹15,000", "Menu & gallery? Malayalam + English, 50% photos supplied."]) expect(message).toContain(detail);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Request Custom Quote" }).click();
  await expect(dialog.getByRole("combobox", { name: "Package of interest" })).toHaveValue("Custom web application");
  await dialog.getByRole("button", { name: "Close project brief" }).click();
  await page.locator("header").getByRole("button", { name: "Let’s talk", exact: true }).click();
  await expect(dialog.getByRole("radio", { name: "Website", exact: true })).toBeChecked();
  await expect(dialog.getByRole("combobox", { name: "Package of interest" })).toHaveValue("Help me choose");
});

test("all six demo concepts have real local pages and truthful enquiry links", async ({ page, request }) => {
  await page.goto("/");
  const links = ["restaurants-cafes", "salons-beauty", "construction", "boutiques-shops", "travel-homestays", "professional-services"].map((slug) => `/website-demos/${slug}`);
  await expect(page.locator(".gallery-image-stage img")).toHaveCount(6);
  await expect(page.locator('a[href^="/website-demos/"]')).toHaveCount(0);
  expect(links).toHaveLength(6);
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain("DEMO CONCEPT · FICTIONAL BUSINESS");
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const enquiry = page.getByRole("link", { name: "Enquire for a Similar Website", exact: true });
    const url = new URL((await enquiry.getAttribute("href"))!);
    expect(url.pathname).toBe("/917558920076");
    expect(url.searchParams.get("text")).toContain("demo concept");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  expect((await request.get("/website-demos/not-a-real-demo")).status()).toBe(404);
});

test("pricing and enquiry controls fit phones, tablets and desktops on both pages", async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of ["/", "/small-business-websites"]) {
    await page.goto(path);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const section of ["#top", "#packages", "#business-websites", "#contact"]) {
        await page.locator(section).scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} ${section} at ${width}px`).toBeTruthy();
      }
      const floating = await page.locator(".floating-whatsapp").boundingBox();
      expect(floating!.x).toBeGreaterThanOrEqual(0);
      expect(floating!.x + floating!.width).toBeLessThanOrEqual(width);
      if (path === "/" && width <= 390) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        const explore = await page.getByRole("link", { name: "Explore Website Packages", exact: true }).boundingBox();
        expect(explore!.y + explore!.height).toBeLessThan(750);
      }
    }
  }
});

test("floating WhatsApp leaves package buttons reachable", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const floating = page.locator(".floating-whatsapp");
  const choose = page.getByRole("link", { name: "Choose This Package: Business Premium", exact: true });
  await choose.scrollIntoViewIfNeeded();
  await choose.evaluate((element) => {
    const corner = document.querySelector(".floating-whatsapp")!.getBoundingClientRect();
    const button = element.getBoundingClientRect();
    scrollTo({ top: scrollY + button.top + button.height / 2 - corner.top - corner.height / 2, behavior: "instant" });
  });
  if (isMobile) {
    await expect(floating).toHaveAttribute("data-obstructing", "true");
    await expect(floating).not.toBeVisible();
  } else {
    const [button, corner] = await Promise.all([choose.boundingBox(), floating.boundingBox()]);
    expect(corner!.x).toBeGreaterThan(button!.x + button!.width);
  }
  await expect(choose).toBeVisible();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(floating).toBeVisible();
});

test("small phone hero presents the package CTA without hero pricing", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#top")).not.toContainText("₹8,000");
  const cta = await page.getByRole("link", { name: "Explore Website Packages", exact: true }).boundingBox();
  expect(cta!.y + cta!.height).toBeLessThanOrEqual(568);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath("small-phone.png") });
});
