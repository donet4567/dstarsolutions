import { expect, test } from "@playwright/test";

test("themes stay visible at the top on phones with the menu closed", async ({ page, isMobile }, testInfo) => {
  await page.goto("/");
  if (isMobile) await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  const chooser = page.getByRole("group", { name: "Website color theme" });
  await expect(chooser).toBeVisible();
  await expect(chooser.getByRole("button")).toHaveCount(5);
  for (const palette of ["Midnight Navy", "Warm Sand + Plum", "Soft Sage + Bronze/Gold", "Mist Blue + Slate", "Ivory + Lavender"]) {
    await chooser.getByRole("button", { name: palette, exact: true }).click();
    await expect(chooser.getByRole("button", { name: palette, exact: true })).toHaveAttribute("aria-pressed", "true");
  }
  if (isMobile) {
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 900 });
      const header = await page.locator("header").boundingBox();
      const swatches = await chooser.boundingBox();
      expect(swatches!.y).toBeGreaterThanOrEqual(0);
      expect(swatches!.y + swatches!.height).toBeLessThanOrEqual(header!.height);
      expect((await page.getByRole("heading", { level: 1 }).boundingBox())!.y).toBeGreaterThan(header!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    }
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.screenshot({ path: testInfo.outputPath("visible-theme-header.png") });
});

test("process cards animate during scrolling and remain readable with reduced motion", async ({ page, isMobile }, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const section = page.locator("#process");
  await section.scrollIntoViewIfNeeded();
  const sticky = section.locator(isMobile ? ".process-grid" : ".process-stage");
  await expect(sticky).toHaveCSS("position", "sticky");
  for (const [width, height] of isMobile ? [[393, 839], [393, 650], [320, 568]] : [[1280, 900], [1280, 600], [1280, 560]]) {
    await page.setViewportSize({ width, height });
    const seen = new Set<string>();
    for (let step = 0; step <= 20; step++) {
      await section.evaluate((element, step) => scrollTo({ top: scrollY + element.getBoundingClientRect().top + (element.clientHeight - innerHeight) * step / 20, behavior: "instant" }), step);
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      const current = await section.locator('.process-step[data-current="true"] h3').innerText();
      seen.add(current);
      if (step === 10) {
        await page.getByRole("button", { name: "Midnight Navy", exact: true }).click();
        await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
      }
    }
    expect([...seen]).toEqual(["Discover", "Design", "Develop", "Deliver"]);
    const top = await sticky.evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(top - (isMobile ? 144 : 0))).toBeLessThan(2);
    const caption = await section.locator(".process-step").last().locator("small").boundingBox();
    expect(caption!.y + caption!.height).toBeLessThanOrEqual(height);
  }
  await page.screenshot({ path: testInfo.outputPath("process-scroll.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(section.locator(".process-stage")).toHaveCSS("position", "relative");
  for (const card of await section.locator(".process-step").all()) await expect(card).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
});

for (const fallback of [false, true]) {
  test(`flower pixels animate with ${fallback ? "compatibility" : "worker"} rendering`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    if (fallback) await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen", { value: undefined, configurable: true });
    });
    await page.goto("/");
    await expect(page.locator("#top")).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
    await page.getByTestId("hero-sculpture").scrollIntoViewIfNeeded();
    const canvas = page.locator("#top canvas");
    const first = await canvas.screenshot();
    await expect.poll(async () => !(await canvas.screenshot()).equals(first)).toBeTruthy();
    await testInfo.attach("animated-bloom", { body: await canvas.screenshot(), contentType: "image/png" });
    await page.getByRole("button", { name: "Pause animation", exact: true }).click();
    await expect(page.getByRole("button", { name: "Resume animation", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: "Resume animation", exact: true })).toBeDisabled();
  });
}

test("mobile bloom responds to real horizontal touch and keeps vertical scrolling", async ({ page, isMobile }) => {
  test.setTimeout(60_000);
  test.skip(!isMobile, "Native phone gesture regression");
  await page.addInitScript(() => {
    const original = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, ...args: Parameters<Worker["postMessage"]>) {
      const message = args[0];
      if ((message?.type === "input" || message?.type === "init") && message.input) {
        document.documentElement.dataset.bloomRotation = String(message.input.rotation);
        document.documentElement.dataset.bloomProgress = String(message.input.progress);
      }
      return Reflect.apply(original, this, args);
    } as Worker["postMessage"];
  });
  await page.goto("/");
  await expect(page.locator("#top")).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
  const sculpture = page.getByTestId("hero-sculpture");
  await page.evaluate(() => scrollTo({ top: 100, behavior: "instant" }));
  await sculpture.scrollIntoViewIfNeeded();
  await expect.poll(async () => Number(await page.locator("html").getAttribute("data-bloom-progress"))).toBeGreaterThan(0);
  const bounds = (await sculpture.boundingBox())!;
  const x = bounds.x + bounds.width * .25, y = Math.max(180, bounds.y + bounds.height * .5);
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 7; step++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + step * 18, y }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => Number(await page.locator("html").getAttribute("data-bloom-rotation"))).toBeGreaterThan(.2);
  const before = await page.evaluate(() => scrollY);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 8; step++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - step * 18 }] });
    await page.waitForTimeout(24);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 40);
  await client.detach();
});
