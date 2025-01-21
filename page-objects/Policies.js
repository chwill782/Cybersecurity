import { Page, expect, Locator } from '@playwright/test';
import { CreateTag } from './CreateTag';
import { policiesDetails } from '../Data/policiesDetails';
import { getCellsByColumnName } from '../utils/DataGrid/getCellsByColumnName';

export class Policies {
  page: Page;
  policiesNavigationButton: Locator;
  policyStatusFilter: Locator;
  policyStatusDropdown: Locator;
  activeStatus: Locator;
  inactiveStatus: Locator;
  searchPoliciesTextField: Locator;
  createPolicyButton: Locator;
  policyNameTextField: Locator;
  policyDescriptionTextField: Locator;
  statusCheckbox: Locator;
  addSourceTagButton: Locator;
  addDestinationTagButton: Locator;
  accessDropdown: Locator;
  policyType: Locator;
  saveButton: Locator;
  editButton: Locator;
  cancelButton: Locator;
  deleteConfirmButton: Locator;
  deletePolicyButton: Locator;
  addRuleButton: Locator;
  reorderPolicyButton: Locator;
  dragIcon: Locator;
  saveOrderButton: Locator;
  confirmButton: Locator;
  closeIconButton: Locator;
  addSourceTagButtonRule2: Locator;
  addDestinationTagButtonRule2: Locator;
  policyListName: (row: number) => Promise<Locator>;
  policyListRules: (row: number) => Promise<Locator>;
  backButton: Locator;
  tagInfoHelpButton: Locator;

  constructor(thePage: Page) {
    //Element selectors defined for policy page
    this.page = thePage;

    //Button
    this.policiesNavigationButton = this.page.locator('[data-e2e="policies-navigation-link"]');
    this.policyStatusFilter = this.page.locator(
      '[aria-labelledby="selectOptm-label-id-Status mui-component-select-policyStatusFilter"]',
    );
    this.createPolicyButton = this.page.locator('[data-e2e="create-policy-button"]');
    this.addSourceTagButton = this.page.locator('[data-e2e="select source tag rule 1"]');
    this.addDestinationTagButton = this.page.locator('[data-e2e="select destination tag rule 1"]');
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.editButton = this.page.getByRole('button', { name: 'Edit' });
    this.cancelButton = this.page.locator('[data-e2e="cancel policy update"]');
    this.deletePolicyButton = this.page.locator('[data-e2e="delete-policy"]');
    this.deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
    this.addRuleButton = this.page.locator('[data-e2e="policy add rule"]');
    this.reorderPolicyButton = this.page.locator('[data-e2e="Policies Reorder Action Reorder Mode"]');
    this.saveOrderButton = this.page.locator('[data-e2e="Policies Reorder Action Submit"]');
    this.confirmButton = this.page.locator('[data-e2e="Policies Reorder Confirmation Dialog Action Submit"]');
    this.closeIconButton = this.page.locator('[data-testid="CloseIcon"]');
    this.addSourceTagButtonRule2 = this.page.locator('[data-e2e="select source tag rule 2"]');
    this.addDestinationTagButtonRule2 = this.page.locator('[data-e2e="select destination tag rule 2"]');
    this.backButton = this.page.locator('[data-e2e="edit policy back button"]');
    this.tagInfoHelpButton = this.page.locator('[data-e2e="help content dialog button: Rules"]');

    //Dropdown
    this.policyStatusDropdown = this.page.locator('[aria-labelledby="selectOptm-label-id-Status"]');
    this.accessDropdown = this.page.locator('#mui-component-select-access');
    this.policyType = this.page.locator('#mui-component-select-type');

    //Icon
    this.activeStatus = this.page.locator('[data-testid="connected-icon"]');
    this.inactiveStatus = this.page.locator('[data-testid="disconnected-icon"]');
    this.dragIcon = this.page.locator('[data-testid="DragIcon"]');

    //Checkbox
    this.statusCheckbox = this.page.locator('[data-e2e="policy status"]');

    //Field
    this.searchPoliciesTextField = this.page.locator('[data-e2e="DataGrid-Searchbar"]');
    this.policyNameTextField = this.page.locator('[data-e2e="policy name input"]');
    this.policyDescriptionTextField = this.page.locator('[data-e2e="policy description input"]');
    this.policyListName = async (row: number) => (await getCellsByColumnName(this.page, /policy name/i)).nth(row);
    this.policyListRules = async (row: number) => (await getCellsByColumnName(this.page, /rules/i)).nth(row);
  }

  visitPolicyPage = async () => {
    await this.policiesNavigationButton.click();

    await this.page.isVisible('[data-e2e="default-rules-alert"]');
    await expect(this.page).toHaveURL(new RegExp('/policies$'));
  };

  visitNewPolicyPage = async () => {
    await this.visitPolicyPage();
    await this.createPolicyButton.click();
    await expect(this.page).toHaveURL(new RegExp('/policies/new$'));
  };

  searchByStatusDropdown = async (type: string) => {
    await this.policyStatusFilter.click();
    await this.policyStatusDropdown;
    await this.page.click(`li:has-text('${type}')`);
  };

  searchForPolicy = async (policyName: string) => {
    await this.visitPolicyPage();
    await this.page.locator('[data-field="name"]').nth(1).waitFor({ state: 'visible' });
    await this.searchPoliciesTextField.waitFor();
    await this.searchPoliciesTextField.type(policyName), { delay: 100 };
    await this.page.locator('[data-field="name"]').nth(1).waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
  };

  searchAndSelectPolicy = async (policyName: string) => {
    await this.visitPolicyPage();
    await this.page.locator('[data-field="name"]').nth(1).waitFor({ state: 'visible' });
    await this.searchPoliciesTextField.waitFor();
    await this.searchPoliciesTextField.type(policyName), { delay: 100 };
    await this.page.locator('[data-field="name"]').nth(1).waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    await this.page.locator('[data-field="name"]').nth(1).click();
  };

  createPolicy = async (
    policyName: string,
    tagName1: string,
    accessType: string,
    tagName2: string,
    selectType: string,
    additonalSourceTag?: string,
    additionalAccess?: string,
    additionalDestination?: string,
    additionalType?: string,
  ) => {
    // Navigate to policies new page
    await this.page.goto('/' + 'policies/new');
    //Basic Details
    await this.policyNameTextField.fill(policyName);
    await this.policyDescriptionTextField.fill(policiesDetails.policyDescription);
    //Status
    await this.statusCheckbox.check();
    await this.statusCheckbox.isChecked();
    //Rule 1
    const create_tag = new CreateTag(this.page);
    //Source Tag
    await this.addSourceTagButton.click();
    await create_tag.searchForTagPolicies(tagName1);
    await this.page.locator('[data-field="description"]').nth(1).click();
    //Access Dropdown
    await this.accessDropdown.click();
    await this.page.click(`[data-value=${accessType}]`);
    //Destination Tag
    await this.addDestinationTagButton.click();
    await create_tag.searchForTagPolicies(tagName2);
    await this.page.locator('[data-field="description"]').nth(1).click();
    //Type
    await this.policyType.click();
    await this.page.click(`[data-value=${selectType}]`);
    //Rule 2
    if (additonalSourceTag) {
      await this.addRuleButton.click();
      //Source Tag
      await this.addSourceTagButtonRule2.click();
      await create_tag.searchForTagPolicies(additonalSourceTag);
      await this.page.locator('[data-field="description"]').nth(1).click();
    }
    //Access
    if (additionalAccess) {
      await this.accessDropdown.nth(0).click();
      await this.page.click(`[data-value=${accessType}]`);
    }
    if (additionalDestination) {
      //Destination Tag
      await this.addDestinationTagButtonRule2.click();
      await create_tag.searchForTagPolicies(additionalDestination);
      await this.page.locator('[data-field="description"]').nth(1).click();
    }
    if (additionalType) {
      //Type
      await this.policyType.nth(0).click();
      await this.page.click(`[data-value=${selectType}]`);
    }
    await this.saveButton.click();

    // Verify save banner message
    await expect(this.page.locator('[data-e2e="create-policy-mutation-success"]')).toContainText(`${policyName}`);
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;
    await this.page.locator('[aria-label="Dismiss alert"]').click();
    await this.page.waitForTimeout(1000);
  };

  deletePolicy = async (tagName: string) => {
    await this.visitPolicyPage();
    await this.searchForPolicy(tagName);
    await this.page.locator('[data-field="name"]').nth(1).click();
    await this.deletePolicyButton.click();
    await this.page.waitForTimeout(1000);
    await this.deleteConfirmButton.click();

    await expect(this.page.locator('[data-e2e="update-policy-success"]')).toBeVisible;
    await expect(this.page.locator('[data-e2e="success-alert-icon"]')).toBeVisible;

    await this.page.locator('[aria-label="Dismiss alert"]').click();
    await this.page.waitForTimeout(1000);

    await expect(this.page).toHaveURL(new RegExp('/policies$'));
  };

  deleteRule = async (policyName: string, selectRule: string) => {
    await this.searchForPolicy(policyName);
    await this.page.locator('[data-field="name"]').nth(1).click();
    await this.editButton.click();
    await this.page.getByRole('button', { name: `${selectRule}` + ' delete rule' }).click();
  };

  updatePolicyDetails = async (
    policyName: string,
    prevSourceTag: string,
    sourceTag: string,
    accessType: string,
    prevDestinationTag: string,
    destinationTag: string,
    selectType: string,
  ) => {
    await this.searchForPolicy(policyName);
    await this.page.locator('[data-field="name"]').nth(1).click();
    await this.editButton.click();

    //Verify the page header is present
    await expect(this.page.locator('[data-e2e="viewTag-pageHeader"]')).toBeVisible;
    const create_tag = new CreateTag(this.page);
    //Source Tag
    await this.page.getByText('Tag one' + `${prevSourceTag}`).click();

    await create_tag.searchForTagPolicies(sourceTag);
    await this.page.locator('[data-field="description"]').nth(1).click();
    //Access Dropdown
    await this.accessDropdown.click();
    await this.page.click(`[data-value=${accessType}]`);
    //Destination Tag
    await this.page.getByText('Tag two' + `${prevDestinationTag}`).click();

    await create_tag.searchForTagPolicies(destinationTag);
    await this.page.locator('[data-field="description"]').nth(1).click();
    //Type
    await this.policyType.click();
    await this.page.click(`[data-value=${selectType}]`);
    await this.saveButton.click();
    await this.page.locator('[aria-label="Dismiss alert"]').click();
    await this.page.waitForTimeout(1000);
  };

  tagInfoHelp = async () => {
    await this.page.goto('/' + 'policies/new');
    await this.tagInfoHelpButton.click();
    await expect(this.page.locator('[id="helpDialog-markdownContainer"]')).toBeVisible;
  };
}
