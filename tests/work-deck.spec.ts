import {expect,test} from "@playwright/test";

test("project selector supports keyboard, preview and restored focus",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/work");
  const tabs=page.getByRole("tablist",{name:"Selected project index"});
  await tabs.getByRole("tab",{name:"HireVify",exact:true}).click();
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  const project=page.getByRole("button",{name:"Open HireVify project preview",exact:true});
  await project.click();
  await expect(page.getByRole("dialog").getByRole("heading",{name:"HireVify",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");await expect(project).toBeFocused();
  await tabs.getByRole("tab",{name:"HireVify",exact:true}).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab",{name:"Mecardee Rental",exact:true})).toBeFocused();
  await expect(tabs.getByRole("tab",{name:"Mecardee Rental",exact:true})).toHaveAttribute("aria-selected","true");
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    if(width===1440)await page.locator("#selected-work").screenshot({path:".dstar-backups/selected-work-final.png"});
  }
});

test("motion reel plays only in view, pauses and respects reduced motion",async({page})=>{
  await page.goto("/work");
  const reel=page.locator('.motion-reel canvas');
  await reel.scrollIntoViewIfNeeded();
  await expect(reel).toHaveAttribute('data-running','true');
  const before=await reel.evaluate(e=>(e as HTMLCanvasElement).toDataURL());
  await expect.poll(()=>reel.evaluate(e=>(e as HTMLCanvasElement).toDataURL())).not.toBe(before);
  await page.getByRole('button',{name:'Pause reel',exact:true}).click();
  await expect(reel).toHaveAttribute('data-running','false');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.getByRole('button',{name:'Play reel',exact:true})).toHaveCount(0);
  await expect(reel).toHaveAttribute('data-running','false');
  await page.getByRole('button',{name:'Full screen',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBeTruthy();
  await page.getByRole('button',{name:'Exit full screen',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBeFalsy();
});

test("demo gallery reverses horizontally before releasing vertical scroll",async({page})=>{
  test.setTimeout(120000);
  await page.goto('/work');
  await page.evaluate(()=>document.fonts.ready);
  for(const [width,height] of [[320,700],[390,844],[768,1024],[1440,900]]){
    await page.setViewportSize({width,height});
    const journey=page.locator('.study-journey');
    await expect(journey).toHaveAttribute('data-pinned','true');
    await page.locator('.showcase-toolbar').scrollIntoViewIfNeeded();
    const geometry=await journey.evaluate(e=>{
      const rail=e.querySelector('.business-grid')!;
      return {start:e.getBoundingClientRect().top+scrollY-parseFloat((e as HTMLElement).style.getPropertyValue('--study-pin-top')),distance:rail.scrollWidth-rail.clientWidth};
    });
    for(const fraction of [.05,.55,.95,.35,0]){
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+geometry.distance*fraction);
      await expect.poll(()=>page.locator('.business-grid').evaluate(e=>e.scrollLeft)).toBeCloseTo(geometry.distance*fraction,-1);
    }
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+geometry.distance+200);
    await expect.poll(()=>page.locator('.study-pin').evaluate(e=>e.getBoundingClientRect().top)).toBeLessThan(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.study-journey')).toHaveAttribute('data-pinned','false');
  const end=await page.locator('.business-grid').evaluate(e=>e.scrollLeft);
  await page.getByRole('button',{name:'Previous study',exact:true}).click();
  await expect.poll(()=>page.locator('.business-grid').evaluate(e=>e.scrollLeft)).toBeLessThan(end);
});


test("supplied light logo is theme-specific and fits the header",async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to light theme',exact:true}).click();
  const logo=page.locator('header .brand-light img');
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('src','/brand/dstar-light.png');
  await expect(page.locator('header .brand-symbol')).toBeHidden();
  for(const width of [320,390,1440]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  await page.locator('header').screenshot({path:'.dstar-backups/light-logo-final.png'});
  await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
  await expect(logo).toBeHidden();
  await expect(page.locator('header .brand-symbol')).toBeVisible();
});
