import puppeteer from 'puppeteer'

abstract class IEmail {
    protected _email = "";  
    protected _page: puppeteer.Page;

    //page MUST be unique to this instance
    constructor (page : puppeteer.Page){
        this._page = page;
    }

    get email() {
        return this._email;
    }

    abstract async open():Promise<void>;

    abstract async close():Promise<void>;

    abstract async getEmailCount():Promise<number>;

    abstract async getEmailContent(mailId: string):Promise<any>;

    //returns {mailId, sender, subject, url}
    abstract async getEmailList():Promise<any>;
}

export {IEmail};