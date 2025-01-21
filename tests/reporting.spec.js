/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, test } from '.././tests/fixtures/basePage';
import { Reporting } from '../page-objects/Reporting';
import { randomString } from '../utils/random';
import { CreateTag } from '../page-objects/CreateTag';
import { createTagDetails } from '../Data/createTagDetails';
import { Policies } from '../page-objects/Policies';

let policyCreation = true;

test.describe('Create tags to use throughout tests', () => {
  const tagName1 = randomString();
  const tagName2 = randomString();
  const policyName = randomString();

  // Create a auto user tag and auto device tag
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
    if (policyCreation === true) {
      const policiesPage = new Policies(adminUser);
      await policiesPage.deletePolicy(policyName);
    }
    await createTagPage.deleteTag(tagName1);
    await createTagPage.deleteTag(tagName2);
  });

  test.describe('Create policy', () => {
    test.beforeAll(async ({ adminUser }) => {
      const policiesPage = new Policies(adminUser);
      await policiesPage.createPolicy(policyName, tagName1, 'OneWay', tagName2, 'HTTP');
      policyCreation = true;
    });

    test('Visit reporting page successfully', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await reporting.visitReportingPage();
      } else {
        /* empty */
      }
    });

    test('Visit reporting logs tab successfully', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      await adminUser.goto('/' + 'reporting');
      if (await reporting.logsTab.isVisible()) {
        await expect(adminUser.locator('[data-e2e="Audit Logs Search Form Title"]')).toBeVisible();
      } else {
        /* empty */
      }
    });

    test('Search for a topic in logs successfully', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      await adminUser.goto('/' + 'reporting');
      if (await reporting.logsTab.isVisible()) {
        await reporting.search_for_topic('UserTag');
      } else {
        /* empty */
      }
    });

    test('Search for an event in logs successfully', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      await adminUser.goto('/' + 'reporting');
      if (await reporting.logsTab.isVisible()) {
        await reporting.search_for_event('UserTag', 'CREATE');
      } else {
        /* empty */
      }
    });

    //Need e2e identifier for target link in logs
    test.skip('Successfully navigate to link in target column for logs', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      await adminUser.goto('/' + 'reporting/logs');
      await reporting.search_for_topic('UserTag');
      await adminUser.locator('[data-field="target"]').nth(1).click();

      //Expect to be on the tag details page
      await expect(adminUser.locator('[data-testid="DetailsCard"]').first()).toBeVisible();
    });

    test('View chart headers in reporting', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await adminUser.goto('/' + 'reporting/');
        //Gateway status
        await expect(adminUser.locator('[id="details-headingGateway online and offline status"]')).toBeVisible();
        //Users connected
        await expect(adminUser.locator('[id="details-headingUsers connected"]')).toBeVisible();
        //Devices connected
        await expect(adminUser.locator('[id="details-headingDevices connected"]')).toBeVisible();
        //Users auto tag
        await expect(adminUser.locator('[id="details-headingUser auto tags"]')).toBeVisible();
        //Devices auto tag
        await expect(adminUser.locator('[id="details-headingDevices auto tags"]')).toBeVisible();
        //Policies chart
        await expect(adminUser.locator('[id="details-headingPolicies impacting devices"]')).toBeVisible();
        //Pre-auth expiry chart
        await expect(adminUser.locator('[id="details-headingPre-auth token expiration"]')).toBeVisible();
        //Policy status chart
        await expect(adminUser.locator('[id="details-headingPolicies status"]')).toBeVisible();
      } else {
        /* empty */
      }
    });

    test('Can view individual charts successfully', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await adminUser.goto('/' + 'reporting/');
        await adminUser.waitForTimeout(2000);
        //Gateway status
        const gatewayChart = expect(adminUser.locator('[data-e2e="__GATEWAY_STATUS"]'));
        gatewayChart.toBeVisible();
        //Users connected
        const usersConnectedChart = expect(adminUser.locator('[data-e2e="__USERS_CONNECTED"]'));
        usersConnectedChart.toBeVisible();
        //Devices connected
        const devicesConnectedChart = expect(adminUser.locator('[data-e2e="__DEVICES_CONNECTED"]'));
        devicesConnectedChart.toBeVisible();
        //Users auto tag
        const userTagChart = expect(adminUser.locator('[data-e2e="__USERS_AUTO_TAGS"]'));
        userTagChart.toBeVisible();
        //Devices auto tag
        const deviceTagChart = expect(adminUser.locator('[data-e2e="__DEVICES_AUTO_TAGS"]'));
        deviceTagChart.toBeVisible();
        //Policies chart
        const policesImpactChart = expect(adminUser.locator('[data-e2e="__POLICIES_IMPACTING_DEVICES"]'));
        policesImpactChart.toBeVisible();
        //Pre-auth expiry chart
        const preAuthExpiryChart = expect(adminUser.locator('[data-e2e="__PAK_STATUS"]'));
        preAuthExpiryChart.toBeVisible();
        //Policy status chart
        const policiesStatusCart = expect(adminUser.locator('[data-e2e="__MODIFIED_POLICIES"]'));
        policiesStatusCart.toBeVisible();
      } else {
        /* empty */
      }
    });

    // Need e2e identifier for select_policy_reporting function
    test('Verify I can view and navigate to a newly created policy in reporting', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await reporting.select_policy_reporting(policyName);
      } else {
        /* empty */
      }
    });

    test('Verify expiry links within Pre-auth token expiration chart', async ({ adminUser }) => {
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await adminUser.goto('/' + 'reporting/');
        await reporting.expiredLink.click();
        await expect(adminUser).toHaveURL(new RegExp('/tokens$'));
        await adminUser.goto('/' + 'reporting/');
        await reporting.expiredSevenDays.click();
        await adminUser.goto('/' + 'reporting/');
        await reporting.expiredLessThirtyDays.click();
        await expect(adminUser).toHaveURL(new RegExp('/tokens$'));
        await adminUser.goto('/' + 'reporting/');
        await reporting.expiredGreaterThirtyDays.click();
        await expect(adminUser).toHaveURL(new RegExp('/tokens$'));
      } else {
        /* empty */
      }
    });

    test('Verify I should not see no data found text for certain charts', async ({ adminUser }) => {
      test.slow();
      const reporting = new Reporting(adminUser);
      if (await reporting.reportingNavigationButton.isVisible()) {
        await adminUser.goto('/' + 'reporting/');
        //Gateway status
        expect(adminUser.locator('Korlate Template __GATEWAY_STATUS').getByText('No data found.')).toBeVisible;
        //Users connected
        expect(
          adminUser.getByTestId('Korlate Template __USERS_CONNECTED').getByText('No data found.'),
        ).not.toBeVisible();
        expect(
          adminUser.getByTestId('Korlate Template __DEVICES_CONNECTED').getByText('No data found.'),
        ).not.toBeVisible();
        expect(
          adminUser.getByTestId('Korlate Template __USERS_AUTO_TAGS').getByText('No data found.'),
        ).not.toBeVisible();
        expect(
          adminUser.getByTestId('Korlate Template __DEVICES_AUTO_TAGS').getByText('No data found.'),
        ).not.toBeVisible();
        expect(
          adminUser.getByTestId('Korlate Template __PAK_STATUS').getByText('No data found.'),
        ).not.toBeVisible();
        expect(
          adminUser.getByTestId('Korlate Template __MODIFIED_POLICIES').getByText('No data found.'),
        ).not.toBeVisible();
      } else {
        /* empty */
      }
    });
  });
});
