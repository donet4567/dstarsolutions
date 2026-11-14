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
  const viewportHost=page.locator(".world-viewport");
  await expect(viewportHost).toHaveAttribute("data-flight",/flying|landing/);
  const launch=page.getByRole("button",{name:"Take flight",exact:true});
  await expect(viewportHost).toHaveAttribute("data-flight","perched",{timeout:25000});
  const garden=await page.locator(".world-proof").evaluate(el=>el.getBoundingClientRect().toJSON());
  const flower={x:garden!.x+garden!.width*.41,y:garden!.y+garden!.height*.16};
  if(viewport.width<600) await page.touchscreen.tap(flower.x,flower.y);
  else await page.mouse.move(flower.x,flower.y);
  await expect(viewportHost).toHaveAttribute("data-flight","flying");
  await expect(viewportHost).toHaveAttribute("data-flight","perched",{timeout:25000});
  // The three perches are actual glyphs. Approach them with the pointer or touch.
  const letters=await page.locator("#hero-title").evaluate(title=>
    [title.firstChild,title.querySelector("span")?.firstChild,title.querySelector("em")?.firstChild].map(node=>{
      const range=document.createRange();range.setStart(node!,1);range.setEnd(node!,2);
      const box=range.getBoundingClientRect();return {x:box.x+box.width*.5,y:box.y+box.height*.15};
    }));
  for(const letter of letters) {
    if (page.viewportSize()!.width<600) await page.touchscreen.tap(letter.x,letter.y);
    else await page.mouse.move(letter.x,letter.y);
  }
  await expect(viewportHost).toHaveAttribute("data-flight","flying");
  await expect(viewportHost).toHaveAttribute("data-flight","perched",{timeout:25000});
  await launch.click();
  await expect(viewportHost).toHaveAttribute("data-flight","flying");
  const pause=page.getByRole("button",{name:"Pause scene motion",exact:true});
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed","true");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".world-viewport canvas")).toHaveCount(0);
  await expect(page.locator(".world-fallback")).toBeVisible();
  await expect(pause).toBeDisabled();
  await expect(launch).toBeDisabled();
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

test("feature headings have distinct entrances and the footer signature has no extra monogram", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toHaveClass(/title-in-view/);
  for (const [selector, effect] of [["#custom-apps-title", "title-assemble"], ["#contact-title", "title-roll"]]) {
    const heading = page.locator(selector);
    await expect(async () => {
      await heading.evaluate(el=>el.scrollIntoView({block:"center",behavior:"instant"}));
      await expect(heading).toBeInViewport({ratio:.5, timeout:1000});
    }).toPass({timeout:10000});
    await expect(heading).toHaveClass(/title-in-view/);
    await expect(heading.locator(".title-line").first()).toHaveCSS("animation-name", effect);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#contact-title .title-line").first()).toHaveCSS("animation-name", "none");
  const signature = page.locator(".footer-signature");
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).not.toContainText("\u2733");
  await expect(signature.locator("img")).toHaveCount(0);
});
