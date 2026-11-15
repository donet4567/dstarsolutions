import {expect,test} from '@playwright/test';

test('short homepage links to five distinct pages with responsive content',async({page,isMobile})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#selected-work,#business-websites,#packages,#contact')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Explore Website Packages',exact:true})).toHaveAttribute('href','/pricing');
  for(const [path,name] of [['work','Work'],['services','Services'],['pricing','Pricing'],['about','About'],['contact','Contact']]){
    await page.locator('footer').getByRole('link',{name,exact:true}).click();
    await expect(page).toHaveURL(new RegExp('/'+path+'$'));
    await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://www.dstarsolutions.in/'+path);
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' at '+width).toBeTruthy();
    }
    await expect(page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('link',{name,exact:true})).toHaveAttribute('aria-current','page');
  }
  await page.setViewportSize({width:isMobile?390:1440,height:900});
  await page.screenshot({path:'.dstar-backups/contact-page-'+(isMobile?'mobile':'desktop')+'.png'});
  await page.locator('header').getByRole('button',{name:'Let’s talk',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('old section links reach their new pages and retain gallery filters',async({page})=>{
  await page.goto('/?category=salons-beauty#business-websites');
  await expect(page).toHaveURL('/work?category=salons-beauty#business-websites');
  await expect(page.locator('.business-card')).toHaveCount(1);
  await page.goto('/#packages');
  await expect(page).toHaveURL('/pricing#packages');
  await expect(page.locator('.price-card')).toHaveCount(3);
  await page.goto('/#contact');
  await expect(page).toHaveURL('/contact#contact');
});

test('plain Cafe label and compact gallery copy remain consistent',async({page})=>{
  await page.goto('/work');
  await expect(page.getByRole('button',{name:'Cafe',exact:true})).toBeVisible();
  await expect(page.getByText('Six fictional businesses. Six distinct directions.')).toHaveCount(0);
  await expect(page.getByText('Open a demo. Find a starting point.')).toHaveCount(0);
  await expect(page.locator('.showcase-note,.demo-label')).toHaveCount(0);
  await page.getByRole('button',{name:'Cafe',exact:true}).click();
  await page.getByRole('link',{name:'View Demo',exact:true}).click();
  await expect(page.locator('.showroom-caption')).toHaveText('Website demo');
  await page.getByRole('link',{name:/Back to Examples/}).click();
  await expect(page).toHaveURL('/work?category=restaurants-cafes#business-websites');
});
