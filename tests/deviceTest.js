import { expect, Locator, Page } from '@playwright/test';
import { Common } from './Common';
import { CreateTag } from './CreateTag';
import { getCellsByColumnName } from '../utils/DataGrid/getCellsByColumnName';

export class Device {
  page: Page;
  deviceNavigationButton: Locator;
  searchFieldText: Locator;
  firstTagLine: Locator;
  addTagButton: Locator;
  ztm_gateway_field: Locator;
  addRouteButton: Locator;
  deleteZTMGatewayButton: Locator;
  revokeReleaseButton: Locator;
  revokeAuthKeyButton: Locator;
  backButton: Locator;
  deleteDeviceButton: Locator;
  deleteConfirmButton: Locator;

  //Element selectors defined
  constructor(thePage: Page) {
    this.page = thePage;

    //Text field
    this.searchFieldText = this.page.locator('[data-e2e="DataGrid-Searchbar"]');
    this.ztm_gateway_field = this.page.locator('[aria-label="ZTM Gateway route 1"]');

    //Button
    this.deviceNavigationButton = this.page.locator('[data-e2e="devices-navigation-link"]');
    this.addTagButton = this.page.locator('[data-e2e="viewMachine-addTagsButton"]');
    this.addRouteButton = this.page.locator('[data-e2e="viewMachine-ZTM-Gateway-Add-Route-button"]');
    this.deleteZTMGatewayButton = this.page.locator('[data-e2e="viewMachine-delete-ZTM-gateway-button-1"]');
    this.revokeReleaseButton = this.page.locator('[data-e2e="revoke-auth-key"]');
    this.revokeAuthKeyButton = this.page.locator('[data-e2e="revoke-device-auth-key"]');
    this.backButton = this.page.locator('[aria-label="go back to devices"]');
    this.deleteDeviceButton = this.page.locator('[data-e2e="viewMachine-delete-button"]');
    this.deleteConfirmButton = this.page.locator('[data-e2e="delete-device"]');
    //List
    this.firstTagLine = this.page.locator('[data-field="name"]').nth(1);
  }

  readonly slowExpect = expect.configure({ timeout: 20000 });

  //Navigation functions
  visitDeviceManagement = async () => {
    await this.deviceNavigationButton.click();
    await expect(this.page).toHaveURL(/devices/);
    await expect(this.page.locator('[data-e2e="machines-pageHeader"]')).toBeVisible;
  };

  searchForDevice = async (deviceName: string) => {
    // Navigate to policies new page
    await this.page.goto('/' + 'devices');
    await this.page.waitForTimeout(3500);
    await this.page.reload();
    // Reload twice due to jenkins, taking some time to find device
    await this.page.reload();
    await this.page.locator('[data-field="name"]').nth(1).waitFor();
    await this.searchFieldText.fill(deviceName);
    await this.page.locator('[data-field="name"]').nth(1).waitFor();
    await expect(this.page.locator('[data-field="name"]').nth(1)).toContainText(deviceName);
    await this.page.waitForTimeout(1000);
  };

  verifyDeviceDetailPage = async (deviceName: string) => {
    await this.visitDeviceManagement();
    await this.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();

    await expect(this.page.locator('h6.MuiTypography-root.MuiTypography-h6')).toHaveText(deviceName);
    await expect(this.page.locator('[id="details-headingDetails"]')).toBeVisible;

    const common = new Common(this.page);
    await common.editButton.waitFor({ state: 'visible' });

    await expect(this.page.getByText('Hostname')).toBeVisible();
    await expect(this.page.getByText('OS', { exact: true })).toBeVisible();
    await expect(this.page.getByText('OS Version')).toBeVisible();
    await expect(this.page.getByText('Location').first()).toBeVisible();
    await expect(this.page.getByText('IPv4')).toBeVisible();
    await expect(this.page.getByText('IPv6')).toBeVisible();

    await expect(this.page.getByText('Registered domain name')).toBeVisible();
    await expect(this.page.getByText('Associated user')).toBeVisible();
    await expect(this.page.getByText('Connectivity')).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Auth key registration' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'ZTM Internet Gateway' })).toBeVisible();
  };

  addTagToDevice = async (deviceName: string, tagName: string) => {
    await this.page.goto('/' + 'devices');
    await this.visitDeviceManagement();
    await this.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();
    const common = new Common(this.page);
    await common.editButton.click();
    await this.addTagButton.click();
    const create_tag = new CreateTag(this.page);
    await create_tag.searchForTagPolicies(tagName);
    await this.page.locator('[data-field="description"]').nth(1).click();
    await common.saveButton.click();
  };

  addRoute = async (deviceName: string, route: string) => {
    await this.page.goto('/' + 'devices');
    const devicePage = new Device(this.page);
    await devicePage.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();
    const common = new Common(this.page);
    await common.editButton.click();
    await devicePage.addRouteButton.click();
    await devicePage.ztm_gateway_field.fill(route);
    await common.saveButton.click();

    await expect(this.page.locator('[data-e2e="viewMachine-update-successful-success"]')).toBeVisible();
    //Needs better identifier
    await expect(this.page.locator('.css-1kxrhf3').nth(0)).toHaveText(route);
  };

  deleteRoute = async (deviceName: string) => {
    const devicePage = new Device(this.page);
    await devicePage.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();
    const common = new Common(this.page);
    await common.editButton.click();
    await devicePage.deleteZTMGatewayButton.click();
    await common.saveButton.click();

    await expect(this.page.locator('[data-e2e="viewMachine-update-successful-success"]')).toBeVisible();
  };

  revokeRelease = async (deviceName: string) => {
    await this.page.goto('/' + 'devices');
    const devicePage = new Device(this.page);
    await devicePage.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();
    const common = new Common(this.page);
    await common.editButton.click();
    await devicePage.revokeReleaseButton.click();
    await devicePage.revokeAuthKeyButton.click();
    await this.page.waitForTimeout(500);
    await common.editButton.click();

    await expect(devicePage.revokeReleaseButton).not.toBeVisible();
  };

  enableDisableInternetGateway = async (deviceName: string) => {
    await this.page.goto('/' + 'devices');
    const devicePage = new Device(this.page);
    await devicePage.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-details-card"]')).toBeVisible();
    const common = new Common(this.page);

    await common.editButton.click();
    await this.slowExpect(this.page.locator('[data-e2e="viewMachine-ZTM-Gateway-Add-Route-button"]')).toBeVisible();

    if (await this.page.locator('[data-e2e="viewMachine-ZTM-Internet-Gateway-Switch-Off"]').isVisible()) {
      await this.page.locator('[data-e2e="viewMachine-ZTM-Internet-Gateway-Switch-Off"]').check();
      await common.saveButton.click();

      await expect(this.page.locator('[data-e2e="viewMachine-update-successful-success"]')).toBeVisible();
      await expect(this.page.getByText('Enabled')).toBeVisible();
    } else {
      await this.page.locator('[data-e2e="viewMachine-ZTM-Internet-Gateway-Switch-On"]').isVisible();
      await this.page.locator('[data-e2e="viewMachine-ZTM-Internet-Gateway-Switch-On"]').click();
      await common.saveButton.click();

      await expect(this.page.locator('[data-e2e="viewMachine-update-successful-success"]')).toBeVisible();
      await expect(this.page.getByText('Disabled')).toBeVisible();
    }
  };

  deleteDevice = async (deviceName: string) => {
    await this.searchForDevice(deviceName);
    await this.page.waitForTimeout(3000);
    await this.page.getByText(deviceName).click();
    await this.deleteDeviceButton.click();
    await this.deleteConfirmButton.click();
    await expect(this.page.locator('[data-e2e="delete-machine-success"]')).toBeVisible();
  };
}
