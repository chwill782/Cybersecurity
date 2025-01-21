/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, test } from '.././tests/fixtures/basePage';
import { policiesDetails } from '../Data/policiesDetails';
import { Policies } from '../page-objects/Policies';
import { CreateTag } from '../page-objects/CreateTag';
import { Common } from '../page-objects/Common';
import { createTagDetails } from '../Data/createTagDetails';
import { faker } from '@faker-js/faker';
import { randomString } from './../utils/random';
import { Reporting } from '../page-objects/Reporting';

let policyCreation = false;
const slowExpect = expect.configure({ timeout: 20000 });
//test.describe.configure({ mode: 'parallel' });

test('Verify the icon help is present on policy new page', async ({ adminUser }) => {
  const policiesPage = new Policies(adminUser);
  await policiesPage.tagInfoHelp();
});

test('Verify user cannot create a policy named Self-to-self', async ({ adminUser }) => {
  const policiesPage = new Policies(adminUser);
  await policiesPage.visitNewPolicyPage();
  await policiesPage.policyNameTextField.fill('Self-to-self');
  await policiesPage.saveButton.click();

  await expect(adminUser.getByText('Policy name is already in use. Please provide a unique name.')).toBeVisible();
});

test('Verify policy name cannot exceed 15 characters', async ({ adminUser }) => {
  const policiesPage = new Policies(adminUser);
  await policiesPage.visitNewPolicyPage();
  await policiesPage.policyNameTextField.fill('This is a long policy name');
  await policiesPage.saveButton.click();

  await expect(adminUser.locator('[data-e2e="policy-name-helperText"]')).toBeVisible();
  await expect(adminUser.getByText('Policy name is required and cannot exceed 15 characters.')).toBeVisible();
});

test('Verify policy description cannot exceed 128 characters', async ({ adminUser }) => {
  const policiesPage = new Policies(adminUser);
  const polDescription = faker.string.alphanumeric(129);

  await policiesPage.visitNewPolicyPage();
  await policiesPage.policyDescriptionTextField.fill(polDescription);
  await policiesPage.saveButton.click();

  await slowExpect(adminUser.locator('[data-e2e="policy-description-helperText"]')).toBeVisible();
  await expect(
    adminUser.getByText('Policy description is required and cannot exceed 128 characters'),
  ).toBeVisible();
});

test.describe('Create tags to use throughout tests', () => {
  const tagName1 = randomString();
  const tagName2 = randomString();
  const policyName = randomString();
  const policyName2 = randomString();

  test.beforeAll(async ({ adminUser }) => {
    test.slow();
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.createNewTagManual(tagName1, createTagDetails, 'user', process.env.OKTA_USERNAME as string);

    await createTagPage.createAutoTag(
      tagName2,
      createTagDetails,
      'user',
      'auto',
      '__first_name',
      'STARTS_WITH',
      'Test',
    );
  });

  //Clean up - Remove created tags, policies, after all tests are completed
  test.afterAll(async ({ adminUser }) => {
    // Set timeout for this hook.
    test.slow();
    const createTagPage = new CreateTag(adminUser);
    await createTagPage.deleteTag(tagName1);
    await createTagPage.deleteTag(tagName2);
  });

  test.describe('Create policies for a select group of tests', () => {
    test.beforeAll(async ({ adminUser, performance }) => {
      const policiesPage = new Policies(adminUser);
      performance.sampleStart('Create a policy');
      await policiesPage.createPolicy(policyName, tagName1, 'OneWay', tagName2, 'HTTP');
      performance.sampleEnd('Create a policy');
      //expect(performance.getSampleTime('Create a policy')).toBeLessThanOrEqual(9500);

      policyCreation = true;
    });

    test('Search for a specified policy within list page @smokeTest', async ({ adminUser, performance }) => {
      const policiesPage = new Policies(adminUser);
      performance.sampleStart('Search for a policy');
      await policiesPage.searchForPolicy(policyName);
      performance.sampleEnd('Search for a policy');
      //expect(performance.getSampleTime('Search for a policy')).toBeLessThanOrEqual(2000);

      //Verify policy name appears within policy management table
      await expect(await policiesPage.policyListName(1)).toContainText(policyName);

      await expect(policiesPage.activeStatus).toBeVisible();
      await policiesPage.closeIconButton.click();
    });

    test('Verify modal appears when canceling an attempted edit', async ({ adminUser, performance }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.searchForPolicy(policyName);
      await expect(policiesPage.activeStatus).toBeVisible();

      await adminUser.locator('[data-field="name"]').nth(1).click();
      await policiesPage.editButton.click();
      await policiesPage.policyNameTextField.fill('New Policy');
      await policiesPage.cancelButton.click();

      await expect(adminUser.getByText('Leave this page?')).toBeVisible();
      await adminUser.getByRole('button', { name: 'Leave without saving' }).click();
      await expect(adminUser.getByText('Leave this page?')).not.toBeVisible();
    });

    test('Visit policy list page successfully', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.visitPolicyPage();
    });

    test('Visit new policy page successfully', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.visitNewPolicyPage();
    });

    test('Verify self tag is a user tag within self policy view page', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.searchAndSelectPolicy('Self to Self');
      const create_tag = new CreateTag(adminUser);

      // Verify I see 2 user tags visible within policy page view
      await expect(create_tag.userIcon.nth(1)).toBeVisible;
      await expect(create_tag.userIcon.nth(2)).toBeVisible;
      //Device icon should not be present
      await expect(create_tag.deviceIcon).not.toBeVisible;
    });

    test('Verify an error message appears when saving a policy with no rules', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);

      await policiesPage.searchForPolicy(policyName);

      //Should have 1 rule present
      await expect(await policiesPage.policyListRules(1)).toHaveText('1');
      await policiesPage.closeIconButton.click();
      await policiesPage.deleteRule(policyName, 'Rule 1');
      // Verify the save button is disabled and still on the edit policy page
      await policiesPage.saveButton.isDisabled();

      await expect(adminUser).toHaveURL(new RegExp('/edit$'));
    });

    test('Verify tag detail modal appears within policy view page', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      const common = new Common(adminUser);
      await policiesPage.visitNewPolicyPage();
      await policiesPage.searchAndSelectPolicy(policyName);
      await common.verifyTagChipDetailPage();
    });

    test('Verify active/inactive status within a policy', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.searchForPolicy(policyName);
      await expect(policiesPage.activeStatus).toBeVisible();

      await adminUser.locator('[data-field="name"]').nth(1).click();
      await policiesPage.editButton.click();
      //Status
      await policiesPage.statusCheckbox.click();

      await expect(adminUser.locator('.MuiFormControlLabel-label')).toContainText('Not Active');

      await policiesPage.saveButton.click();

      await expect(adminUser.locator('[data-e2e="update-policy-success"]').nth(0)).toContainText(`${policyName}`);
      await expect(adminUser.locator('[data-e2e="success-alert-icon"]')).toBeVisible();

      await adminUser.locator('[aria-label="Dismiss alert"]').click();
      await adminUser.waitForTimeout(1000);
      await policiesPage.searchForPolicy(policyName);

      //Status is now inactive
      await expect(policiesPage.inactiveStatus).toBeVisible();
      await policiesPage.closeIconButton.click();
    });

    test('Verify policy should be present within tag view page', async ({ adminUser }) => {
      test.slow();
      const policiesPage = new Policies(adminUser);
      const createTagPage = new CreateTag(adminUser);
      await createTagPage.searchForTag(tagName1);
      await adminUser.locator('[data-field="name"]').nth(1).click();

      //Verify policy is present within the tag detail page for source tag
      await adminUser.waitForTimeout(1000);
      await expect(adminUser.locator('[data-e2e="impacted-policies-widget-content"]')).toContainText(policyName);

      await createTagPage.visitTagManagement();
      await createTagPage.searchForTag(tagName2);
      await adminUser.locator('[data-field="name"]').nth(1).click();

      //Verify policy is present within the tag detail page for destination tag
      await expect(adminUser.locator('[data-e2e="impacted-policies-widget-content"]')).toHaveText(policyName);
    });

    test('Verify I can edit/update policy information', async ({ adminUser }) => {
      // test.slow();
      const policiesPage = new Policies(adminUser);
      await policiesPage.updatePolicyDetails(policyName, tagName1, tagName2, 'BothWays', tagName2, tagName1, 'RDP');
      await policiesPage.searchForPolicy(policyName);
      await adminUser.locator('[data-field="name"]').nth(1).click();

      //Verify updated policy tags & access within policy details page
      await expect(adminUser.locator(' .MuiChip-label').nth(0)).toHaveText(tagName2);
      await expect(adminUser.locator(' .MuiChip-label').nth(1)).toHaveText(tagName1);
    });

    test('Enable/disable self to self policy', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.searchAndSelectPolicy('Self to Self');
      await policiesPage.editButton.click();
      //Status
      await policiesPage.statusCheckbox.click();
      await policiesPage.saveButton.click();
      await expect(adminUser.locator('[data-e2e="update-policy-success"]')).toBeVisible();
      await expect(adminUser.locator('[data-e2e="success-alert-icon"]')).toBeVisible();
    });

    test('Verify the search persists on the policy management list page', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.searchForPolicy(policyName);
      (await policiesPage.policyListName(1)).click();

      await expect(adminUser).toHaveURL(/policies/);

      await policiesPage.backButton.click();

      await expect(adminUser).toHaveURL(/filterModel/);

      //Verify the searched policy name, rules, status are still selected.
      await expect(await policiesPage.policyListName(1)).toContainText(policyName);
      await expect(await policiesPage.policyListRules(1)).toContainText('1');
    });

    test.describe('All tests related to creating new policies', () => {
      const attributeData = [
        {
          sourceTag: tagName1,
          access: 'OneWay',
          destinationTag: tagName2,
          type: 'RDP',
        },
        {
          sourceTag: tagName1,
          access: 'BothWays',
          destinationTag: tagName2,
          type: 'HTTPS',
        },
        {
          sourceTag: tagName1,
          access: 'DenyOneWay',
          destinationTag: tagName2,
          type: 'MYSQL',
        },
        {
          sourceTag: tagName1,
          access: 'DenyBothWays',
          destinationTag: tagName2,
          type: 'ICMP',
        },
      ];
      attributeData.forEach((data) => {
        test(`Create a ${data.access} policy, active`, async ({ adminUser }) => {
          test.slow;
          const policiesPage = new Policies(adminUser);
          const policyName = faker.string.alphanumeric(5) + 'Test';
          await policiesPage.createPolicy(policyName, data.sourceTag, data.access, data.destinationTag, data.type);
          policyCreation = true;
          await policiesPage.searchForPolicy(policyName);

          //Verify policy name, desc, status, rules amount appear within policy management table
          await expect(await policiesPage.policyListName(1)).toContainText(policyName);
          await expect(adminUser.locator('[data-field="description"]').nth(1)).toContainText(
            policiesDetails.policyDescription,
          );
          await expect(await policiesPage.policyListRules(1)).toContainText('1');
          await expect(policiesPage.activeStatus).toBeVisible();
          await policiesPage.closeIconButton.click();
          if (policyCreation === true) {
            const policiesPage = new Policies(adminUser);
            await policiesPage.deletePolicy(policyName);
          }
        });
      });

      test('Add additional rules to a policy, then delete that new rule', async ({ adminUser }) => {
        test.slow();
        const policiesPage = new Policies(adminUser);
        const policyName = faker.string.alphanumeric(5) + 'Test';
        await policiesPage.createPolicy(
          policyName,
          tagName1,
          'OneWay',
          tagName2,
          'RDP',
          tagName2,
          'BothWays',
          tagName1,
          'SSH',
        );
        policyCreation = true;

        await policiesPage.searchForPolicy(policyName);

        //Verify policy name, desc, status appear within policy management table
        await expect(await policiesPage.policyListName(1)).toContainText(policyName);
        await expect(adminUser.locator('[data-field="description"]').nth(1)).toContainText(
          policiesDetails.policyDescription,
        );
        //Verify 2 rules are now present
        await expect(await policiesPage.policyListRules(1)).toHaveText('2');
        await expect(policiesPage.activeStatus).toBeVisible();

        //Deleting a rule
        await policiesPage.closeIconButton.click();
        await policiesPage.deleteRule(policyName, 'Rule 2');
        await policiesPage.saveButton.click();

        await expect(adminUser.locator('[data-e2e="update-policy-success"]').nth(0)).toContainText(`${policyName}`);
        if (policyCreation === true) {
          const policiesPage = new Policies(adminUser);
          await policiesPage.deletePolicy(policyName);
        }
      });
    });

    test('Reorder policy within management list table', async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      const policyName = faker.string.alphanumeric(5) + 'Test';
      await policiesPage.createPolicy(policyName, tagName1, 'DenyBothWays', tagName2, 'SSH');
      policyCreation = true;
      const UserSecondColumn = await adminUser.locator('[data-field="name"]').nth(2).innerText();
      await policiesPage.reorderPolicyButton.click();
      await policiesPage.dragIcon.nth(1).dragTo(await policiesPage.dragIcon.nth(0));
      await adminUser.waitForTimeout(1000);
      await policiesPage.saveOrderButton.click();
      await policiesPage.confirmButton.click();
      //Verify Policy order save banner
      await expect(adminUser.locator('[data-e2e="update-policy-order-success"]')).toBeVisible();
      await adminUser.locator('[aria-label="Dismiss alert"]').click();
      await adminUser.waitForTimeout(2000);
      const UserFirstColumn = await adminUser.locator('[data-field="name"]').nth(1).innerText();
      expect(UserSecondColumn).toEqual(UserFirstColumn);
    });
  });

  // Need e2e identifier for select_policy_reporting function
  test('Verify I cannot navigate to a deleted policy in reporting', async ({ adminUser }) => {
    const reporting = new Reporting(adminUser);
    const policiesPage = new Policies(adminUser);
    await policiesPage.createPolicy(policyName2, tagName1, 'OneWay', tagName2, 'HTTP');
    await policiesPage.deletePolicy(policyName2);
    await reporting.select_policy_reporting(policyName2);

    await slowExpect(adminUser.getByRole('heading', { name: 'Details not available' })).toContainText(
      'Details not available',
    );
    await adminUser.getByRole('button', { name: 'Dismiss' }).click();
  });
});
