// // This is used to do expectations(similart to assert) and test to start your test cases. 
// const {test, expect} = require("@playwright/test")

// // Navigates to the url before each test
// test.beforeEach(async ({ page }) => {
//     // Go to the starting url before each test.
//     await page.goto('/');
// });
// test("first test", async ({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/");
//     await page.locator('//a[@href="/abtest"]').click();
//     // page.url captures the current page url
//     const url = page.url();
//     expect(url).toBe('https://the-internet.herokuapp.com/abtest')
// })

// test("enter text", async ({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/login");
//     const userName = page.locator("#username");
//     // need fine-grained keyboard events, you use page.type.
//     await userName.type('tomsmith', {delay:1000});
//     const password = page.locator("#password")
//     // page.fill to be used whenever one needs to fill a form
//     await password.fill('SuperSecretPassword!');
//     const login_button = page.locator('//button[@class="radius"]')
//     await login_button.click();

// })

// test("enter checkbox", async ({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/checkboxes");
//     const checkbox2 = page.locator('#checkboxes>input:nth-child(1)')
//     await checkbox2.check();
//     // Verify that the checkbox is checked
//     expect(await checkbox2.isChecked()).toBeTruthy()

// })

// test("select dropdown", async ({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/dropdown");
//     const dropdown = page.locator("select#dropdown")
//     await dropdown.selectOption('Option 1')
//     // verify the selected dropdown is available
//     const value = await dropdown.textContent()
//     await expect(value.includes("Option 1")).toBeTruthy

// })

// // Verify if an item on the page is visible or not


// // Section on assertions
// test("expect assertions", async({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/");
//     const ab = page.locator('//a[@href="/abtest"]')
//     // expect the text of the identifier
//     const text  = await ab.textContent();
//     expect(text).toBe('A/B Testing')
//     // or
//     expect(text).toEqual('A/B Testing')
// })

// test("expect element has text", async({page})=>{
//     await page.goto("https://the-internet.herokuapp.com/");
//     const ab = page.locator('//a[@href="/abtest"]');
//     // verify the actual text is present
//     await expect(ab).toHaveText('A/B Testing');
// })

// test("expect element to be visible", async({page})=>{
//     //await page.goto("https://the-internet.herokuapp.com/");
//     const ab = page.locator('//a[@href="/abtest"]');
//     // verify the actual text is present
//     await expect(ab).toBeVisible();
// })

// test("expect page to have title", async({page})=>{
//     //await page.goto("https://the-internet.herokuapp.com/");
//     // verify the page title is present
//     await expect(page).toHaveURL('https://the-internet.herokuapp.com/')
// })

