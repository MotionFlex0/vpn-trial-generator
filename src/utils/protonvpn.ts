import puppeteer from "puppeteer"
import crytoRandomString from "crypto-random-string"

class ProtonVPN {
    private _page: puppeteer.Page;
    private _username: string;
    private _password: string;
    private _smsOnly = false;

    constructor (page: puppeteer.Page) {
        this._page = page;

        this._username = "";
        this._password = "";
    }

    get username() {
        return this._username;
    }

    get password() {
        return this._password;
    }

    get smsOnly() {
        return this._smsOnly;
    }

    //Once this function is done, and the code has been received, call verifyEmailAddress(code)
    async signup(email: string) {
        await this.gotoIfNot("https://account.protonvpn.com/signup");
        
        this._username = crytoRandomString({length: 8, characters:"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"});
        this._password = crytoRandomString({length: 12, type: "distinguishable"});

        await this._page.waitForSelector(".pm-button.w100.mtauto.pm-button--primaryborder");
        await this._page.$$eval(".pm-button.w100.mtauto.pm-button--primaryborder", x => {
            const freeAccountBtn = <HTMLButtonElement>x.reduce((prevBtn, btn) => {
                return (btn.innerHTML == "Get Free" ? btn : prevBtn)
            });
            freeAccountBtn.click();
        });
        
        
        await (await this._page.waitForSelector("#email")).type(email, { delay: 100 });
        await this._page.type("#password", this._password, { delay: 100 });
        await this._page.type("#passwordConfirmation", this._password, { delay: 100 });
        
        const usernameInput = await this._page.$("#username");
        if (usernameInput === null)
            return false;

        while(1) {
            await usernameInput.type(this._username, { delay:100 }); //this is done last, in case we need to change the username
            await this._page.click(".pm-button.pm-button--primary[type=submit]", {delay:200});
            await this._page.waitFor(2000);
            const usernameError = await this._page.$("#username+div.error-zone");
            if (usernameError == null)
                break;
            
            const isErrorVisible = (await usernameError.boundingBox())!.height >= 0;
            if (isErrorVisible) { //WE are gonna guess the error is already used username.
                this._username = crytoRandomString({length: 8, characters:"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"});
                await usernameInput.click({clickCount:3, delay:60});
                await usernameInput.press("Backspace", {delay: 200});
            }
            else
                return false; //something else has gone wrong. bye
        }
        await (await this._page.waitForSelector("form>div.mb1+div>.pm-button.pm-button--primary[type=submit]")).click({delay:200});
        this._smsOnly = ((await this._page.$eval(".pm-field-container > .pt0-5.mb1", x => x.children.length)) == 1)
        return !this._smsOnly;
    }

    async verfiyEmailAddress(code: string) {
        await this._page.type("#code", code.toString(), { delay:100 });
        await this._page.click(".mb1 > .pm-button.pm-button--primary[type=submit]", {delay:250});
        await this._page.waitForNavigation();
        return this._page.url().search("://account.protonvpn.com") >= 0;
    }

    async close() {
        await this._page.close();
    }

    //Needs to be the exact URL, including / if root.
    private async gotoIfNot(url: string) {
        if (this._page.url() !== url) {
            console.log(`[gotoIfNot()]: navigating to [${url}] from [${this._page.url()}].`)
            await this._page.goto(url);
        }
    }
};

export { ProtonVPN as protonvpn };