const { test, expect } = require("@playwright/test")

export class CreateTag {
    constructor(page) {
        this.page = page
        this.tagHeaderButton = page.getByRole('button', { name: 'tags navigation link' })
        this.tagManagementHeader = page.locator('[data-testid="Tag Management page heading"]')
        this.searchFieldText = page.locator('input[placeholder="Search tags"]')
        this.createATagButton = page.getByRole('button', { name: 'Create Tag' })
        this.tagChip = page.locator('.MuiChip-root.MuiChip-tag-chip.MuiChip-sizeMedium')
        this.detailsName = page.locator('input[name="name"]')
        this.detailsDescription = page.locator('textarea[name="description"]')
        this.searchDeviceTextField = page.locator('input[placeholder="Search devices"]')
        this.selectAllRowsCheckbox = page.locator('input[type=checkbox][aria-label="Select all rows"]')
        this.selectRow = page.getByRole('checkbox', { name: 'Select row' })
        this.saveButton = page.getByRole('button', { name: 'Save' })
        this.machineIcon = page.locator('[data-testid="machineTagIcon"]')
        this.dataResultsNameField = page.locator('[data-field="name"]')
        this.deleteTagButton = page.getByRole('button', { name: 'Delete' })
        this.deleteConfirmButton = page.getByRole('button', { name: 'Confirm' })
    }

    visitCreateTag = async () => {
        await this.tagHeaderButton.click()
        await expect(this.page).toHaveURL(new RegExp('/tags$'));
        await expect(this.tagManagementHeader).toHaveText('Tag Management');
    }

    search_for_tag = async (tagName) => {
        await this.searchFieldText.fill(tagName);
    }

    delete_tag = async (tagName) => {
        //await this.page.reload()
        await this.searchFieldText.fill('');
        await this.searchFieldText.fill(tagName);
        await this.machineIcon.click()
        await this.deleteTagButton.click()
        await this.deleteConfirmButton.click()
        await this.page.pause()
    }
    createNewTagManualMachine = async (tagName, createTagDetails) => {
        await this.createATagButton.click()
        await expect(this.page).toHaveURL(new RegExp('/tags/new$'));
        await this.detailsName.fill(tagName)
        await this.detailsDescription.fill(createTagDetails.description)
        await this.searchDeviceTextField.fill(createTagDetails.device)
        await this.selectRow.waitFor({ state: "visible" })
        await this.selectRow.check()
        expect(await this.selectRow.isChecked()).toBeTruthy()
        await this.saveButton.click()

    }

}