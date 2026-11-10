import {expect,test} from "@playwright/test";

test("selected work index opens the correct project and returns keyboard focus",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  const index=page.getByRole("navigation",{name:"Selected project index"});
  await index.getByRole("link",{name:/HireVify/}).click();
  await expect(page).toHaveURL(/#work-hirevify$/);
  const project=page.locator("#work-hirevify>button");
  await project.focus();await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog").getByRole("heading",{name:"HireVify",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");await expect(project).toBeFocused();
  for(const width of [360,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    await page.locator("#selected-work").scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
});
