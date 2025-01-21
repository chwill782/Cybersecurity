/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, test } from './fixtures/basePage';
import { createTagDetails } from '../Data/createTagDetails';
import { CreateTag } from '../page-objects/CreateTag';
import { Common } from '../page-objects/Common';
import { faker } from '@faker-js/faker';
import { randomString } from '../utils/random';

let createATag = false;

test('Verify icon help is present on tag new page', async ({ adminUser }) => {
  const createTagPage = new CreateTag(adminUser);
  await createTagPage.tagInfoHelp();
});

test.describe('Create tags used for tests in this group', () => {
  const manualTestTag = randomString();
  const autoTestTag = randomString();

  test.beforeAll(async ({ adminUser, performance }) => {
    test.slow();
    const createTagPage = new CreateTag(adminUser);
    //Creating a manual user tag
    performance.sampleStart('Create manual user tag');
    await createTagPage.createNewTagManual(
      manualTestTag,
      createTagDetails,
      'user',
      process.env.OKTA_USERNAME as string,
    );
    performance.sampleEnd('Create manual user tag');
    //expect(performance.getSampleTime('Create manual user tag')).toBeLessThanOrEqual(4500);

    //Creating an auto user tag
    performance.sampleStart('Create auto user tag');
    await createTagPage.createAutoTag(
      autoTestTag,
      createTagDetails,
      'user',
      'auto',
      '__user_name',
      'MATCH',
      process.env.OKTA_USERNAME as string,
    );
    performance.sampleEnd('Create auto user tag');
    //expect(performance.getSampleTime('Create auto user tag')).toBeLessThanOrEqual(6000);
  });

  //Clean up - Remove created tags after all tests are completed
  test.afterAll(async ({ adminUser }) => {
    // Set timeout for this hook.
    test.setTimeout(45000);
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.searchForTag(manualTestTag);
    await createTagPage.deleteTag(manualTestTag);
    await createTagPage.searchForTag(manualTestTag);
    await createTagPage.deleteTag(autoTestTag);
  });

  test('Can successfully navigate to the tag management list page', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.visitTagManagement();
  });

  test('Can successfully navigate to the create new tag page', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.visitTagCreation();
  });

  test('Search for a specific manual user tag @smokeTest', async ({ adminUser, performance }) => {
    const createTagPage = new CreateTag(adminUser);
    performance.sampleStart('Search for user tag');
    await createTagPage.searchForTag(manualTestTag);

    //Verify the searched tag name, assignmment and attribute appears.
    await expect(createTagPage.tagChip).toHaveText(manualTestTag);
    await expect(await createTagPage.assignmentStatus(1)).toHaveText('Manual');
    performance.sampleEnd('Search for user tag');
    //expect(performance.getSampleTime('Search for user tag')).toBeLessThanOrEqual(4000);
  });

  test('Verify client side error mesage appears within tag creation', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    // Navigate to tag new page
    await adminUser.goto('/' + 'tags/new');
    const common = new Common(adminUser);
    await common.saveButton.click();

    await expect(adminUser.locator('[data-e2e="alert"]')).toBeVisible;
    await expect(adminUser.getByText('Tag name is required and cannot exceed 15 characters.')).toBeVisible;
    await expect(adminUser.getByText('Tag description is required and cannot exceed 128 characters')).toBeVisible;
  });

  test('Verify client side error mesage appears within tag creation edit page', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    const common = new Common(adminUser);
    await createTagPage.searchForTag(autoTestTag);
    await createTagPage.firstTagLine.click();
    await common.editButton.click();
    await createTagPage.detailsName.fill('');
    await createTagPage.detailsDescription.fill('');
    await common.saveButton.click();

    await expect(adminUser.locator('[data-e2e="alert"]')).toBeVisible;
    await expect(adminUser.getByText('Tag name is required and cannot exceed 15 characters.')).toBeVisible;
    await expect(adminUser.getByText('Tag description is required and cannot exceed 128 characters')).toBeVisible;
  });

  test('Verify the user auto tag details page headers are present', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.verifyAutoTagDetailPage(autoTestTag, createTagDetails);
  });

  test('Verify the user manual tag details page headers are present', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.verifyManualTagDetailPage(manualTestTag, createTagDetails);
  });

  test('Verify I cannot save a tag without an attribute present', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    const common = new Common(adminUser);
    await createTagPage.searchForTag(autoTestTag);
    await createTagPage.firstTagLine.click();

    await common.editButton.click();
    await createTagPage.deleteAttributeButton.click();
    await createTagPage.saveButton.click();

    //Verify error message appears and user remains on edit page after saving.
    await expect(adminUser.locator('[data-e2e="alert"]')).toBeVisible();
    await expect(adminUser).toHaveURL(new RegExp('/edit$'));
  });

  test('Verify I cannot search by self tag within management list page', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.searchForTag('Self');
    const wholeGrid = await adminUser.locator('[data-testid="table_tags_DataGrid"]');

    // Expect not to see the self tag within tag management list
    await expect(wholeGrid).not.toContainText('Self');
  });

  test('Add an additional attribute to user tag, then remove it', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.addAdditionalAttributes(autoTestTag, '__last_name', 'CONTAINS', 'Owner');
    await expect(adminUser.locator('[data-e2e="update-user-tag-success"]')).toBeVisible();
    await createTagPage.searchForTag(autoTestTag);

    //Verify multiple attributes appear on management list page
    await expect(await createTagPage.attributesName(1)).toContainText(process.env.OKTA_USERNAME as string);
    await expect(await createTagPage.attributesName(1)).toContainText('Last name:Owner');

    //Delete newly added attribute
    await createTagPage.deleteAttribute(autoTestTag);
    await createTagPage.searchForTag(autoTestTag);

    //Verify an attribute is still available
    await expect(await createTagPage.attributesName(1)).toBeVisible();
  });

  test('Verify tag filters work within the filter feature', async ({ adminUser }) => {
    const tagName = faker.string.alphanumeric(5) + 'Test';
    const createTagPage = new CreateTag(adminUser);
    const common = new Common(adminUser);
    await createTagPage.visitTagManagement();
    await createTagPage.search_filter('Tag', 'equals', manualTestTag);

    //Expect tag name to appear
    await expect(createTagPage.tagChip).toContainText(manualTestTag);
  });
});

//Grouping tests related to creating tags
test.describe('All tests related to creating new tags', () => {
  const attributes = [
    {
      name: '__display_name',
      pickOption: 'MATCH',
      enterString: 'Test Owner',
      attributeName: 'Display name:Test Owner',
      //entity: '1',
    },
    {
      name: '__last_name',
      pickOption: 'CONTAINS',
      enterString: 'Owner',
      attributeName: 'Last name:Owner',
      //entity: '1',
    },
    {
      name: '__first_name',
      pickOption: 'STARTS_WITH',
      enterString: 'Test',
      attributeName: 'First name:Test',
      //entity: '2',

      // Need to add more attributes to Test user link for task: https://optminc.atlassian.net/browse/M8SERV2-876
    },
    // {
    //   name: 'Location',
    //   pickOption: 'MATCH',
    //   enterString: 'Corporate HQ',
    //   attributeName: 'Location:Corporate HQ',
    //   //entity: '4',
    // },
    // {
    //   name: '__department',
    //   pickOption: 'ENDS_WITH',
    //   enterString: 'DevOps',
    //   attributeName: 'Department:DevOps',
    //   //entity: '150',
    // },
    // {
    //   name: '__division',
    //   pickOption: 'CONTAINS',
    //   enterString: 'Production',
    //   attributeName: 'Division:Production',
    //   //entity: '150',
    // },
    // {
    //   name: '__manager',
    //   pickOption: 'MATCH',
    //   enterString: 'Pete Rozelle',
    //   attributeName: 'Manager:Pete Rozelle',
    //   //entity: '149',
    // },
    {
      name: '__title',
      pickOption: 'STARTS_WITH',
      enterString: 'Boss',
      attributeName: 'Title:Boss',
      //entity: '149',
    },
    {
      name: '"Cost Center"',
      pickOption: 'CONTAINS',
      enterString: 'us-east',
      attributeName: 'Cost Center:us-east',
      //entity: '3',
    },
  ];
  attributes.forEach((data) => {
    test(`Create auto user tag by ${data.name} attribute`, async ({ adminUser }) => {
      test.slow();
      const createTagPage = new CreateTag(adminUser);
      const tagName = faker.string.alphanumeric(5) + 'QE';

      await createTagPage.createAutoTag(
        tagName,
        createTagDetails,
        'user',
        'auto',
        data.name,
        data.pickOption,
        data.enterString,
      );
      createATag = true;

      // Verify save banner message and URL
      await expect(adminUser.locator('[data-e2e="create-user-tag-success"]')).toContainText(`${tagName}`);

      await expect(adminUser).toHaveURL(/tags/);

      await createTagPage.searchForTag(tagName);

      // Verify the name, attribute, icon, assignment of tag on management list page
      await expect(createTagPage.tagChip).toHaveText(tagName);
      await expect(await createTagPage.attributesName(1)).toHaveText(data.attributeName);
      await expect(createTagPage.userIcon).toHaveCount(1);
      await expect(await createTagPage.assignmentStatus(1)).toHaveText('Auto');
      if (createATag === true) {
        const createTagPage = new CreateTag(adminUser);
        await createTagPage.deleteTag(tagName);
      }
    });
  });

  test('Create a user auto tag and verify I can add additional values', async ({ adminUser }) => {
    test.slow();
    const createTagPage = new CreateTag(adminUser);
    const tagName = faker.string.alphanumeric(5) + 'QE';
    await createTagPage.createAutoTag(
      tagName,
      createTagDetails,
      'user',
      'auto',
      '__first_name',
      'CONTAINS',
      'Test',
      'CONTAINS',
      'Owner',
    );
    createATag = true;
    // Verify save banner message and URL
    await expect(adminUser.locator('[data-e2e="create-user-tag-success"]')).toContainText(`${tagName}`);
    await expect(adminUser).toHaveURL(/tags/);

    await createTagPage.searchForTag(tagName);

    // Verify the name, attributes and icon of tag on tag management list page
    await expect(createTagPage.tagChip).toHaveText(tagName);
    await expect(await createTagPage.attributesName(1)).toContainText('First name:TestOROwner');
    await expect(createTagPage.userIcon).toHaveCount(1);
    if (createATag === true) {
      const createTagPage = new CreateTag(adminUser);
      await createTagPage.deleteTag(tagName);
    }
  });

  test('Create and then edit a user auto tag', async ({ adminUser }) => {
    const createTagPage = new CreateTag(adminUser);
    const tagName = faker.string.alphanumeric(5) + 'QE';
    await createTagPage.createAutoTag(
      tagName,
      createTagDetails,
      'user',
      'auto',
      '__first_name',
      'STARTS_WITH',
      'Test',
    );
    createATag = true;

    // Verify save banner message and URL
    await expect(adminUser.locator('[data-e2e="create-user-tag-success"]')).toContainText(`${tagName}`);
    await expect(adminUser).toHaveURL(/tags/);

    await createTagPage.searchForTag(tagName);

    // Verify the  name, attribute and icon of tag on management list page
    await expect(createTagPage.tagChip).toHaveText(tagName);
    await expect(await createTagPage.attributesName(1)).toBeVisible();
    await expect(createTagPage.userIcon).toHaveCount(1);

    await createTagPage.firstTagLine.click();
    await createTagPage.editAutoTag(createTagDetails, '__last_name', 'STARTS_WITH', 'Owner');
    await createTagPage.searchForTag(tagName);

    // Verify attributes tag is accurate and has been updated
    await expect(await createTagPage.attributesName(1)).toBeVisible();
    // Verify device icon is present
    await expect(createTagPage.userIcon).toHaveCount(1);
    if (createATag === true) {
      const createTagPage = new CreateTag(adminUser);
      await createTagPage.deleteTag(tagName);
    }
  });
});
