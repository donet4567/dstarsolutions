import { expect, test } from "@playwright/test";

test("the bloom renders in a worker and keeps its controls", async ({ page }) => {
  const worker = page.waitForEvent("worker");
  await page.goto("/");
  await worker;
  await expect(page.locator("#top")).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
  await page.getByRole("button", { name: "Rotate bloom left" }).click();
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume animation", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("browsers without transferable canvases retain the same interactive bloom", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen", { value: undefined, configurable: true });
  });
  const workers: string[] = [];
  page.on("worker", (worker) => workers.push(worker.url()));
  await page.goto("/");
  await expect(page.locator("#top")).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
  await expect(page.locator("#top canvas")).toBeVisible();
  await page.getByRole("button", { name: "Rotate bloom right" }).click();
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume animation", exact: true })).toBeVisible();
  expect(workers).toHaveLength(0);
});
