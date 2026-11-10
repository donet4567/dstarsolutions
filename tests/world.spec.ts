import { expect, test } from "@playwright/test";

test("full-screen 3D world supports release, pause, reduced motion and route cleanup", async ({ page }) => {
  test.setTimeout(90_000);
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
  await page.goto("/");
  await expect(page.locator(".world-viewport")).toHaveAttribute("data-ready","true",{timeout:30_000});
  const bounds=await page.locator(".world-viewport canvas").boundingBox();
  const viewport=page.viewportSize()!;
  expect(Math.round(bounds!.width)).toBe(viewport.width);
  expect(Math.round(bounds!.height)).toBe(viewport.height);
  const release=page.getByRole("button",{name:"Release forms",exact:true});
  await release.click();
  await expect(page.getByRole("button",{name:"Gather forms",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(page.locator(".world-viewport")).toHaveAttribute("data-scatter","dispersed");
  const pause=page.getByRole("button",{name:"Pause scene motion",exact:true});
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed","true");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".world-viewport canvas")).toHaveCount(0);
  await expect(page.locator(".world-fallback")).toBeVisible();
  await expect(pause).toBeDisabled();
  await page.getByRole("button",{name:"Gather forms",exact:true}).click();
  await expect(page.locator(".studio-world")).toHaveAttribute("data-dispersed","false");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await expect(page.locator(".world-viewport")).toHaveAttribute("data-ready","true",{timeout:30_000});
  await page.getByRole("link",{name:"View Demo",exact:true}).first().click();
  await expect(page.locator(".world-viewport")).toHaveCount(0);
  await expect(page.locator("h1")).toContainText("Good food.");
  expect(errors).toEqual([]);
});

test("cinematic controls and business actions remain readable across screen sizes",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  for(const width of [320,360,390,768,1024,1440]) {
    await page.setViewportSize({width,height:width===320?568:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px`).toBeTruthy();
    const button=page.getByRole("button",{name:"Pause scene motion",exact:true});
    const bounds=await button.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
    await expect(page.getByRole("link",{name:"Explore Website Packages",exact:true})).toBeVisible();
  }
});
