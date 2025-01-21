// This is used to do expectations(similart to assert) and test to start your test cases. 
const { test, expect } = require("@playwright/test")
// This is to generate tags/machines with unique names
// reference https://www.udemy.com/course/automated-web-testing/learn/lecture/35756742#overview
import { v4 as uuidv4 } from 'uuid';
import { Login } from "../page-objects/Login"
import { CreateTag } from "../page-objects/CreateTag"
import { createTagDetails } from "../Data/createTagDetails"

let createATag = false;

//test.describe.only('Grouping tests related to tags', () => {
test.beforeEach(async ({ page }) => {
    const login = new Login(page)
    await login.visit();
    await login.optm_login('chris.williams@optm.com', 'chris.williams@optm.com', process.env.OKTA_PASSWORD)
});

test("Search for a specific tag", async ({ page }) => {
    const createTag = new CreateTag(page)
    await createTag.visitCreateTag();
    await createTag.search_for_tag("Android 13")
    await expect(createTag.tagChip).toHaveText('Android 13');
})

test.afterEach(async ({ page }) => {
    const createTag = new CreateTag(page)
    await createTag.visitCreateTag();
    await createTag.search_for_tag("Test")
        if (createATag === true) {
            await createTag.delete_tag("Test");
}})
test("Create a new machine tag", async ({ page }) => {
    const createTag = new CreateTag(page)
    await createTag.visitCreateTag();
    await createTag.createNewTagManualMachine("Test", createTagDetails)
    createATag = true;
    await createTag.search_for_tag("Test")
    await expect(createTag.tagChip).toHaveText('Test');
    await expect(createTag.machineIcon).toHaveCount(1);
})
