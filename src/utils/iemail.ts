import puppeteer from 'puppeteer'

abstract class IEmail {
    private _email = "";  
    private _page: puppeteer.Page;

    //page MUST be unique to this instance
    constructor (page : puppeteer.Page){
        this._page = page;
    }

    get email() {
        return this._email;
    }

    abstract async open():Promise<string>;

    abstract async close():Promise<void>;

    abstract async getEmailCount():Promise<number>;

    abstract async getEmailContent(mailId: string):Promise<any>;

    //returns {mailId, sender, subject, url}
    abstract async getEmailList():Promise<any>;

    //Needs to be the exact URL, including / if root.
    protected abstract async gotoIfNot(url: string):Promise<void>
}

export {IEmail};