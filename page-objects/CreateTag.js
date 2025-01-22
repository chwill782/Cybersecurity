import { expect, Page, Locator } from '@playwright/test';
import { tagDetails } from '../Data/createTagDetails';
import { Common } from './Common';
import { getCellsByColumnName } from '../utils/DataGrid/getCellsByColumnName';

export class CreateTag {
  page: Page;
  searchFieldText: Locator;
  detailsDescription: Locator;
  searchTextField: Locator;
  tagChip: Locator;
  deviceIcon: Locator;
  userIcon: Locator;
  tagType: Locator;
  tagNavigationButton: Locator;
  createATagButton: Locator;
  detailsName: Locator;
  saveButton: Locator;
  deleteConfirmButton: Locator;
  firstTagLine: Locator;
  selectRow: Locator;
  assignTypeSelection: Locator;
  selectAttributeSelection: Locator;
  pickOptionSelector: Locator;
  enterString: Locator;
  attributeChip: Locator;
  devices_userTab: Locator;
  attributesTab: Locator;
  devicesDataRow: Locator;
  usersTab: Locator;
  valueButton: Locator;
  addAttributesButton: Locator;
  deleteAttributeButton: Locator;
  selectTagFieldText: Locator;
  tagChipDetailsDropdown: Locator;
  viewTagDetailButton: Locator;
  filtersButton: Locator;
  assignmentStatus: (row: number) => Promise<Locator>;
  attributesName: (row: number) => Promise<Locator>;
  backButton: Locator;
  assignedToStatus: (row: number) => Promise<Locator>;
  tagInfoHelpButton: Locator;

  constructor(thePage: Page) {
    //Element selectors defined for tag page
    this.page = thePage;
    //Text field
    this.detailsName = this.page.locator('[data-e2e="tag-name-input"]');
    this.selectTagFieldText = this.page.locator('input[placeholder="Search"]');
    this.searchFieldText = this.page.locator('[data-e2e="DataGrid-Searchbar"]');
    this.detailsDescription = this.page.locator('[data-e2e="tag-description-input"]');
    this.searchTextField = this.page.locator('.MuiInputBase-inputSizeSmall.MuiInputBase-inputAdornedStart').nth(0);
    this.enterString = this.page.locator('[data-e2e="tags-attributes-enter-value"]');
    this.assignmentStatus = async (row: number) => (await getCellsByColumnName(this.page, /assignment/i)).nth(row);
    this.attributesName = async (row: number) => (await getCellsByColumnName(this.page, /attributes/i)).nth(row);
    this.assignedToStatus = async (row: number) => (await getCellsByColumnName(this.page, /assigned to/i)).nth(row);

    //Icon
    this.tagChip = this.page.locator('.MuiChip-root.MuiChip-tag-chip');
    this.deviceIcon = this.page.locator('[data-e2e="machineTagIcon"]');
    this.userIcon = this.page.locator('[data-e2e="userTagIcon"]');
    this.attributeChip = this.page.locator('.MuiChip-root.MuiChip-status-chip.MuiChip-sizeMedium');

    //Dropdown
    this.tagType = this.page.locator('[data-e2e="tags-tag-type-dropdown"]');
    this.assignTypeSelection = this.page.locator('[data-e2e="tags-assignment-type-dropdown"]');
    this.selectAttributeSelection = this.page.locator('[data-e2e="tags-select-attribute-dropdown"]');
    this.pickOptionSelector = this.page.locator('[data-e2e="tag-pick-option-for-attribute-dropdown"]');

    //Button
    this.tagNavigationButton = this.page.locator('[data-e2e="tags-navigation-link"]');
    this.createATagButton = this.page.locator('[data-e2e="create-tag-button"]');
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.deleteConfirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.devices_userTab = this.page.locator('.MuiButtonBase-root.MuiTab-root').nth(1);
    this.usersTab = this.page.getByRole('tab', { name: 'Users' });
    this.attributesTab = this.page.getByRole('tab', { name: 'Attributes' });
    this.valueButton = this.page.locator('[data-e2e="tags-add-attribute-value-button"]');
    this.addAttributesButton = this.page.locator('[data-e2e="tags-add-attributes"]');
    this.deleteAttributeButton = this.page.locator('[aria-label="Delete Attribute"]');
    this.tagChipDetailsDropdown = this.page
      .locator('div')
      .filter({ hasText: /^Basic details$/ })
      .getByRole('button')
      .first();
    this.viewTagDetailButton = this.page.getByRole('button', { name: 'View Tag Details' });
    this.filtersButton = this.page.locator('[aria-label="Show filters"]');
    this.backButton = this.page.locator('[data-e2e="viewTag-backButton"]');
    this.tagInfoHelpButton = this.page.locator('[data-e2e="help content dialog button: Tag properties"]');

    //List
    this.firstTagLine = this.page.locator('[data-field="attributes"]').nth(1);
    this.selectRow = this.page.getByRole('checkbox', { name: 'Select row' }).nth(0);
    this.devicesDataRow = this.page.locator('[data-rowindex="0"]');
  }

  readonly slowExpect = expect.configure({ timeout: 10000 });

  //Navigation functions
  visitTagManagement = async () => {
    await this.tagNavigationButton.click();
    await expect(this.page).toHaveURL(/tags/);
    await expect(this.page.locator('[data-e2e="tags-pageHeader"]')).toBeVisible;
  };

  visitTagCreation = async () => {
    await this.page.goto('/' + 'tags/');
    await this.createATagButton.click();
    await expect(this.page).toHaveURL(new RegExp('/tags/new$'));
  };
  //Test Functions
  searchForTagPolicies = async (tagName: string) => {
    await this.page.locator('[placeholder="Search"]').waitFor();
    await this.selectTagFieldText.fill(tagName);
    await this.page.locator('[placeholder="Search"]').waitFor();
    await this.page.waitForTimeout(1000);
  };

  searchForTag = async (tagName: string) => {
    await this.page.goto('/' + 'tags/');
    await this.page.locator('[data-field="name"]').nth(1).waitFor();
    await this.searchFieldText.fill(tagName);
    await this.page.locator('[data-field="name"]').nth(1).waitFor();
    await this.page.waitForTimeout(1000);
  };

  deleteTag = async (tagName: string) => {
    await this.page.goto('/' + 'tags/');
    await this.page.waitForTimeout(1000);
    await this.searchFieldText.fill('');
    await this.searchFieldText.fill(tagName);
    await this.page.waitForTimeout(500);
    await this.firstTagLine.click();
    const common = new Common(this.page);
    await common.deleteButton.click();
    await this.page.waitForTimeout(500);
    await this.deleteConfirmButton.click();
    await expect(this.userIcon).not.toBeVisible;
    await expect(this.deviceIcon).not.toBeVisible;
  };

  //This is for tests that verify that a tag should not be deleted
  deleteTagFail = async (tagName: string) => {
    await this.page.goto('/' + 'tags/');
    await this.page.waitForTimeout(1000);
    await this.searchFieldText.fill('');
    await this.searchFieldText.fill(tagName);
    await this.page.waitForTimeout(500);
    await this.firstTagLine.click();
    const common = new Common(this.page);
    await common.deleteButton.click();
    await this.page.waitForTimeout(500);
    await this.deleteConfirmButton.click();
  };

  createNewTagManual = async (
    tagName: string,
    createTagDetails: tagDetails,
    tagType: 'machine' | 'user',
    selection: string,
  ) => {
    // Navigate to tag new page
    await this.page.goto('/' + 'tags/new');
    await this.detailsName.fill(tagName);
    await this.detailsDescription.fill(createTagDetails.description);
    // Select tag type
    await this.tagType.click();
    await this.page.click(`[data-value=${tagType}]`);
    await this.searchTextField.fill(selection);

    await expect(this.page.locator('div.MuiDataGrid-cell').nth(1)).toHaveText(selection);
    await this.selectRow.check();
    expect(await this.selectRow.isChecked()).toBeTruthy();
    await this.saveButton.click();

    //Expect save banner
    await expect(this.page.locator('.MuiAlert-message')).toContainText(`${tagName}`);
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;
    await expect(this.page).toHaveURL(/tags/);
  };

  createNewTagManualNegative = async (
    tagName: string,
    createTagDetails: tagDetails,
    tagType: 'machine' | 'user',
    selection: string,
  ) => {
    // Navigate to tag new page
    await this.page.goto('/' + 'tags/new');
    await this.detailsName.fill(tagName);
    await this.detailsDescription.fill(createTagDetails.description);
    // Select tag type
    await this.tagType.click();
    await this.page.click(`[data-value=${tagType}]`);
    await this.searchTextField.fill(selection);

    await expect(this.page.locator('div.MuiDataGrid-cell').nth(1)).toHaveText(selection);
    await this.selectRow.check();
    expect(await this.selectRow.isChecked()).toBeTruthy();
    await this.saveButton.click();
    await expect(this.page.locator('[data-e2e="create-machine-tag-error"]')).toBeVisible;
    await expect(this.page.locator('[data-e2e="error-alert-icon"]')).toBeVisible;
  };

  createAutoTag = async (
    tagName: string,
    createTagDetails: tagDetails,
    tagType: 'machine' | 'user',
    assignType: string,
    selectAtt: string,
    pickOption: string,
    device: string,
    additonalPickOption?: string,
    additionalEnterString?: string,
  ) => {
    // Navigate to tag new page
    await this.page.goto('/' + 'tags/new');
    await this.detailsName.fill(tagName);
    await this.detailsDescription.fill(createTagDetails.description);
    // Tag Type selection
    await this.tagType.click();
    await this.page.click(`[data-value=${tagType}]`);
    // Assignment type selection
    await this.assignTypeSelection.click();
    await this.page.click(`[data-value=${assignType}]`);
    // Select attribute
    await this.selectAttributeSelection.click();
    await this.page.click(`[data-value=${selectAtt}]`);
    // Pick an option
    await this.pickOptionSelector.click();
    await this.page.click(`[data-value=${pickOption}]`);
    // Enter a string
    await this.enterString.fill(device);
    //Verify device appears within devices tab
    if (additonalPickOption) {
      await this.valueButton.click();
      await this.pickOptionSelector.nth(1).click();
      await this.page.click(`[data-value=${pickOption}]`);
    }
    if (additionalEnterString) {
      // Enter a string
      await this.enterString.nth(1).fill(additionalEnterString);
    }
    await this.devices_userTab.click();
    await this.devicesDataRow.waitFor({ state: 'visible' });
    await this.saveButton.click();

    //Expect save banner
    await expect(this.page.locator('.MuiAlert-message')).toContainText(`${tagName}`);
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible();
    await expect(this.page).toHaveURL(/tags/);
  };

  verifyAutoTagDetailPage = async (tagName: string, createTagDetails: tagDetails) => {
    await this.page.goto('/' + 'tags/');
    await this.searchForTag(tagName);
    await this.firstTagLine.click();
    await expect(this.page.locator('h6.MuiTypography-root.MuiTypography-h6')).toHaveText(tagName);
    const common = new Common(this.page);
    await common.deleteButton.waitFor({ state: 'visible' });
    await common.editButton.waitFor({ state: 'visible' });
    await expect(this.page.getByRole('heading', { name: 'Basic Details' })).toBeVisible;
    await expect(this.page.getByTestId('Name DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByTestId('Description DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByRole('heading', { name: 'Impacted Policies' })).toBeVisible;
    await expect(this.page.getByText('Policies containing rules that use the selected tag.')).toHaveText(
      createTagDetails.policyText,
    );
    await expect(this.page.getByTestId('Type DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByTestId('Assignment DetailsDisplayContainer title')).toBeVisible;
    await this.attributesTab.waitFor({ state: 'visible' });
    await this.devices_userTab.waitFor({ state: 'visible' });
    await this.page.locator('.MuiTypography-root.MuiTypography-body2').waitFor({ state: 'visible' });
  };

  verifyManualTagDetailPage = async (tagName: string, createTagDetails: tagDetails) => {
    await this.page.goto('/' + 'tags/');
    await this.searchForTag(tagName);
    await this.firstTagLine.click();
    await expect(this.page.locator('h6.MuiTypography-root.MuiTypography-h6')).toHaveText(tagName);
    const common = new Common(this.page);
    await common.deleteButton.waitFor({ state: 'visible' });
    await common.editButton.waitFor({ state: 'visible' });
    await expect(this.page.getByRole('heading', { name: 'Basic Details' })).toBeVisible;
    await expect(this.page.getByTestId('Name DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByTestId('Description DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByRole('heading', { name: 'Impacted Policies' })).toBeVisible;
    await expect(this.page.getByText('Policies containing rules that use the selected tag.')).toHaveText(
      createTagDetails.policyText,
    );
    await expect(this.page.locator('[id="details-headingTag Properties"]')).toBeVisible;
    await expect(this.page.getByTestId('Type DetailsDisplayContainer title')).toBeVisible;
    await expect(this.page.getByTestId('Assignment DetailsDisplayContainer title')).toBeVisible;
  };

  // Note that this function works starting in the edit details page
  editAutoTag = async (createTagDetails: tagDetails, selectAtt: string, pickOption: string, device: string) => {
    const common = new Common(this.page);
    await common.editButton.click();
    //Verify the page header is present
    await expect(this.page.locator('[data-e2e="viewTag-pageHeader"]')).toBeVisible;
    //Select attribute
    await this.selectAttributeSelection.click();
    await this.page.click(`[data-value=${selectAtt}]`);
    //Pick an option
    await this.pickOptionSelector.click();
    await this.page.click(`[data-value=${pickOption}]`);
    //Enter a string
    await this.enterString.fill(device);
    //Verify device appears within devices tab
    await this.devices_userTab.click();
    await this.devicesDataRow.waitFor({ state: 'visible' });
    await this.saveButton.click();

    //Verify success banner
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;
  };

  addAdditionalAttributes = async (tagName: string, selectAtt: string, pickOption: string, device: string) => {
    await this.searchForTag(tagName);
    await this.firstTagLine.click();
    const common = new Common(this.page);
    await common.editButton.click();
    await this.addAttributesButton.click();
    //Select attribute
    await this.selectAttributeSelection.nth(1).click();
    await this.page.click(`[data-value=${selectAtt}]`);
    //Pick an option
    await this.pickOptionSelector.nth(1).click();
    await this.page.click(`[data-value=${pickOption}]`);
    //Enter a string
    await this.enterString.nth(1).fill(device);
    //Verify device appears within devices tab
    await this.devices_userTab.click();
    await this.devicesDataRow.waitFor({ state: 'visible' });
    await this.saveButton.click();

    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;
  };

  deleteAttribute = async (tagName: string) => {
    await this.page.goto('/' + 'tags/');
    await this.searchForTag(tagName);
    await this.firstTagLine.click();
    const common = new Common(this.page);
    await common.editButton.click();
    await this.deleteAttributeButton.nth(1).click();
    await this.saveButton.click();

    //Verify success banner
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;
  };

  tagInfoHelp = async () => {
    await this.page.goto('/' + 'tags/new');
    await this.tagInfoHelpButton.click;
    await expect(this.page.locator('[id="helpDialog-markdownContainer"]')).toBeVisible;
  };

  search_filter = async (columns: string, operator: string, filter: string) => {
    await expect(this.page.locator('[data-e2e="DataGrid-Searchbar"]')).toBeVisible();
    await this.slowExpect(this.page.locator('[data-field="name"]').nth(1)).toBeVisible();
    await this.filtersButton.click();
    await this.page.waitForTimeout(1500);
    await this.page.getByRole('combobox', { name: 'Columns' }).selectOption(`${columns}`);
    await this.page.getByRole('combobox', { name: 'Operator' }).selectOption(`${operator}`);
    await this.page.getByPlaceholder('Filter value').fill(`${filter}`);
    await this.page.waitForTimeout(1000);
    await expect(this.page.locator('[data-e2e="DataGrid-Searchbar"]')).toBeVisible();
  };
}
