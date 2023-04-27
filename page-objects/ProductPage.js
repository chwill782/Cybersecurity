export class ProductPage {
    constructor(page) {
        this.page = page
    }

    visit = async() => {
        await this.page.goto('/');
    }
}