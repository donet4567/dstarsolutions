import { expect, test, type Page } from "@playwright/test";

async function expectReadableText(page: Page, selectors: string[]) {
  const failures = await page.evaluate((selectors) => {
    const rgb = (color: string) => color.match(/^rgba?\(([^)]+)\)$/)?.[1].split(/[, /]+/).map(Number);
    const luminance = (values: number[]) => values.slice(0, 3).map((value) => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    return selectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)).flatMap((element) => {
      const style = getComputedStyle(element);
      const foreground = rgb(style.color);
      let background: number[] | undefined;
      for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
        const candidate = rgb(getComputedStyle(ancestor).backgroundColor);
        if (candidate && (candidate[3] ?? 1) === 1) { background = candidate; break; }
      }
      if (!foreground || !background) return [`${selector}: could not resolve colors`];
      const light = luminance(foreground), dark = luminance(background);
      const ratio = (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      return ratio + .01 >= (large ? 3 : 4.5) ? [] : [`${selector}: ${ratio.toFixed(2)}:1`];
    }));
  }, selectors);
  expect(failures, "Text should meet WCAG AA contrast against its rendered surface").toEqual([]);
}

const themes = [
  ["ivory", "Ivory + Lavender", "rgb(252, 251, 249)"],
  ["sand", "Warm Sand + Plum", "rgb(247, 241, 232)"],
  ["sage", "Soft Sage + Bronze/Gold", "rgb(244, 246, 239)"],
  ["mist", "Mist Blue + Slate", "rgb(241, 246, 248)"],
  ["midnight", "Midnight Navy", "rgb(13, 20, 34)"],
] as const;

test("all five palettes persist and cover sections, previews, navigation and enquiry", async ({ page, isMobile }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  // Keep QA still and avoid traversing the existing pinned stories on every palette.
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [id, name, background] of themes) {
    if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
    const chooser = page.getByRole("group", { name: "Website color theme" }).filter({ visible: true });
    const palette = chooser.getByRole("button", { name, exact: true });
    if (isMobile) await palette.click();
    else { await palette.focus(); await page.keyboard.press("Space"); }
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await expect(chooser.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(chooser.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator("body")).toHaveCSS("background-color", background);
    if (id !== "ivory") {
      const colors = await page.evaluate(() => {
        const text = getComputedStyle(document.body).color;
        return [text, ...[".services h2", ".process-section h2", "#founder-title", ".footer-contact-phone"].map((selector) => getComputedStyle(document.querySelector(selector)!).color)];
      });
      expect(new Set(colors).size).toBe(1);
      await expectReadableText(page, [".services h2", ".services .muted", ".process-section h2", "#founder-title", "#founder-title em", ".footer-contact-phone", ".contact-content p", ".contact-content h2 em"]);
    }
    expect(await page.evaluate(() => localStorage.getItem("dstar-theme"))).toBe(id);
    if (isMobile) await page.getByRole("button", { name: "Close navigation" }).click();
    await page.screenshot({ path: testInfo.outputPath(`${id}-hero.png`) });

    const modes = page.getByRole("group", { name: "Website preview size" });
    for (const mode of ["Mobile", "Desktop"]) {
      const toggle = modes.getByRole("button", { name: `${mode} view`, exact: true });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByLabel(`${mode} website concept preview`, { exact: true })).toBeVisible();
      const touchTarget = await toggle.boundingBox();
      expect(touchTarget!.height).toBeGreaterThanOrEqual(44);
    }
    await page.locator("#services").screenshot({ path: testInfo.outputPath(`${id}-services.png`) });
    await page.locator("#digital-journey").screenshot({ path: testInfo.outputPath(`${id}-journey.png`) });
    await page.locator("#selected-work").screenshot({ path: testInfo.outputPath(`${id}-work.png`) });
    await page.locator("#engineering").screenshot({ path: testInfo.outputPath(`${id}-studio.png`) });
    await page.locator("#process").screenshot({ path: testInfo.outputPath(`${id}-process.png`) });
    await page.locator("#contact").screenshot({ path: testInfo.outputPath(`${id}-contact.png`) });
    const founder = page.getByRole("region", { name: "Great ideas deserve to become something real." });
    await founder.screenshot({ path: testInfo.outputPath(`${id}-founder.png`) });
    await page.locator("footer").screenshot({ path: testInfo.outputPath(`${id}-footer.png`) });
    await founder.getByRole("button", { name: "Let’s build it", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /It starts with/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox")).toBeEditable();
    await dialog.screenshot({ path: testInfo.outputPath(`${id}-enquiry.png`) });
    await page.keyboard.press("Escape");
    await expect(founder.getByRole("button", { name: "Let’s build it", exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
  }
  expect(errors).toEqual([]);
});

test("saved palette is applied before body parsing", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dstar-theme", "midnight");
    new MutationObserver((_, observer) => {
      if (!document.body) return;
      document.documentElement.dataset.firstBodyTheme = document.documentElement.dataset.theme;
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-first-body-theme", "midnight");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("unavailable storage falls back to ivory and themes still work", async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivory");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Midnight Navy", exact: true }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
});

test("founder reveal respects motion preferences and sits immediately before the footer", async ({ page }) => {
  await page.goto("/");
  const founder = page.getByRole("region", { name: "Great ideas deserve to become something real." });
  const note = founder.locator("[data-reveal]");
  await expect(note).toHaveClass(/will-reveal/);
  await founder.scrollIntoViewIfNeeded();
  await expect(note).toHaveClass(/is-visible/);
  await expect(founder.locator("blockquote")).toHaveCSS("opacity", "1");
  expect(await founder.evaluate((element) => element === document.querySelector("main")?.lastElementChild && document.querySelector("main")?.nextElementSibling?.tagName === "FOOTER")).toBeTruthy();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(founder.locator("blockquote")).toHaveCSS("transition-duration", "0s");
  await expect(founder.locator("blockquote")).toHaveCSS("opacity", "1");
  await page.reload();
  await founder.scrollIntoViewIfNeeded();
  await expect(founder.locator("h2")).toBeVisible();
  await expect(note).not.toHaveClass(/will-reveal/);
});

test("theme selectors and navigation fit small phones and tablets", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 761, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width <= 760) await page.getByRole("button", { name: "Open navigation" }).click();
    const options = page.getByRole("group", { name: "Website color theme" }).filter({ visible: true });
    await expect(options).toBeVisible();
    const bounds = await options.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    if (width <= 760) await page.keyboard.press("Escape");
  }
});
