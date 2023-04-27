const {test, expect} = require("@playwright/test")
import { OktaLogin } from "./OktaLogin"

export class Login {
    //Element selectors defined
    constructor(page) {
        this.page = page

        //Text field
        this.emailTextbox = page.locator('#email')
        this.signInButton = page.locator('#btn-login')
        //Button
        this.oktaSubmit = page.locator('okta-signin-submit')
        //Logo
        this.optmLogo = page.locator('svg[@aria-label="Optm Logo"]')

    }

    visit = async () => {
        await this.page.goto("/")
    }
   
    //Functions related to logging in
     optm_login = async(email, oktaUser, oktaPass) =>{
        //Verify optm logo is present
        expect(this.optmLogo).toBe(this.optmLogo);
        await this.emailTextbox.fill(email)
        await expect(this.signInButton).toHaveText("Sign In")
        await this.signInButton.click()
        // Login through okta
        const okta_login = new OktaLogin(this.page)
        await okta_login.oktaUserName.fill(oktaUser);
        await okta_login.oktaPassword.click()
        await okta_login.oktaPassword.fill(oktaPass);
        await okta_login.oktaSubmit.click()
        await expect(this.page.locator('//h6[@aria-label="ZTMesh Dashboard"]')).toHaveText('ZTMesh Dashboard')

}}

    


// Note to add a functionality to test the count of tag before and after creating one.
// An example is here https://www.udemy.com/course/automated-web-testing/learn/lecture/35756664#overview