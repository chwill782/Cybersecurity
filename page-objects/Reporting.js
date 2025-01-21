import { Page, expect, Locator } from '@playwright/test';

export class Reporting {
  page: Page;
  reportingNavigationButton: Locator;
  expiredLink: Locator;
  expiredSevenDays: Locator;
  expiredLessThirtyDays: Locator;
  expiredGreaterThirtyDays: Locator;
  topicDropdown: Locator;
  eventDropdown: Locator;
  searchButton: Locator;
  logsTab: Locator;

  constructor(thePage: Page) {
    //Element selectors defined for reporting page
    this.page = thePage;
    this.reportingNavigationButton = this.page.locator('[data-e2e="reporting-navigation-link"]');
    this.expiredLink = this.page.getByRole('button', { name: 'Show Expired' });
    this.expiredSevenDays = this.page.getByRole('button', { name: 'Show Expired' });
    this.expiredLessThirtyDays = this.page.getByRole('button', { name: 'Show Expiring' }).nth(1);
    this.expiredGreaterThirtyDays = this.page.getByRole('button', { name: 'Show Expiring ≥ 30 days' });
    //dropdown
    this.topicDropdown = this.page.locator('[id="mui-component-select-topic"]');
    this.eventDropdown = this.page.locator('[id="mui-component-select-event"]');

    //button
    this.searchButton = this.page.locator('[data-e2e="Audit Logs Search Form Submit"]');
    this.logsTab = this.page.getByRole('tab', { name: 'Logs' });
  }
  readonly slowExpect = expect.configure({ timeout: 10000 });

  visitReportingPage = async () => {
    await this.reportingNavigationButton.click();
    await expect(this.page.locator('[data-e2e="__GATEWAY_STATUS"]')).toBeVisible();

    await expect(this.page).toHaveURL(new RegExp('/reporting/charts$'));
  };

  // Need e2e identifiers
  select_policy_reporting = async (policyName: string) => {
    await this.page.reload();
    await this.page.goto('/' + 'reporting/');
    await this.slowExpect(
      this.page.locator('.MuiTypography-root.MuiTypography-labelMedium.css-1oi7pk0').nth(0),
    ).toHaveText(policyName);
    await this.page.locator('.MuiTypography-root.MuiTypography-labelMedium.css-1oi7pk0').nth(0).click();
  };

  search_for_topic = async (topic: string) => {
    await this.topicDropdown.click();
    await this.page.click(`[data-value=${topic}]`);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
    await expect(this.page.locator('[data-field="topic"]').nth(1)).toBeVisible();
  };

  search_for_event = async (topic: string, event: string) => {
    await this.topicDropdown.click();
    await this.page.click(`[data-value=${topic}]`);
    await this.eventDropdown.click();
    await this.page.click(`[data-value=${event}]`);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
    await expect(this.page.locator('[data-field="topic"]').nth(1)).toBeVisible();
    await expect(this.page.locator('[data-field="topic"]').nth(1)).toBeVisible();
  };
}
