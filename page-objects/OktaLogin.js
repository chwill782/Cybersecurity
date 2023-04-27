const {test, expect} = require("@playwright/test")

export class OktaLogin {
    constructor(page) {
        this.page = page

        //Text field
        this.oktaUserName = page.locator('#okta-signin-username')
        this.oktaPassword = page.locator('#okta-signin-password')

        //Submit
        this.oktaSubmit = page.locator('#okta-signin-submit')
    }
}