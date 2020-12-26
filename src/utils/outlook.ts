import {IEmail} from "./iemail"
import puppeteer from 'puppeteer'
import { assert } from "console";
import { exit } from "process";

class Outlook extends IEmail {
    async open(): Promise<void> {
        try {
            if (process.env.OXE == undefined || process.env.OXP == undefined) {
                console.error(".env may be missing from the root folder. " +
                   "Create it and add your Outlook email + password with the following format:" +
                   "\nOKE=EMAIL_GOES_HERE\nOKP=PASSWORD_GOES_HERE");
                exit(1);
            }

            const loggedIn = await this.login(process.env.OXE, process.env.OXP);
            if (loggedIn) {

            }
        }
        catch(e) {

        }
        // .type("p6cyexw8@outlook.com"));
    }

    async close(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async getEmailCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async getEmailContent(mailId: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async getEmailList(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    private async login(email: string, password: string): Promise<boolean> {
        try {
            await this.gotoIfNot("https://login.live.com/");
            await this._page.waitForSelector("#i0116[type=email]");
            await this._page.type("#i0116[type=email]", email, {
                delay: 100
            });
            await this._page.click("#idSIButton9[type=submit]");
            await this._page.waitForResponse(response => response.url().startsWith("https://login.live.com/GetCredentialType.srf"));
            aw
            #usernameError
            await this._page.waitForSelector("#i0118[type=password]");
            await this._page.type("#i0118[type=password]", password, {
                delay: 100
            });
            await this._page.click("#idSIButton9[type=submit]");
        }
        catch (e) {
            return false;
        }
        return true;
    }

    //Need to be logged in first
    private async createNewEmailAlias(): Promise<string> {
        
        return "";
    }

    private async gotoIfNot(url: string) {
        if (this._page.url() !== url) {
            console.log(`[gotoIfNot()]: navigating to [${url}] from [${this._page.url()}].`)
            await this._page.goto(url);
        }
    }

}