import puppeteer from 'puppeteer'

class TempEmail {  
    private _email = "";  
    private _page: puppeteer.Page;

    //page MUST be unique to this instance
    constructor (page : puppeteer.Page){
        this._page = page;
    }

    get email() {
        return this._email;
    }

    async open() {
        await this._page.goto("http://temp-mail.org")
        this._email = await this._page.$eval("#mail", mailElement => (<HTMLInputElement>mailElement).value)
    }

    async close() {
        await this._page.close();
    }

    //returns {mailId, sender, subject, url}
    async getEmailList() {
        const count = await this.getEmailCount();
        if (count < 1)
            return [{}];
        
        const emailList = await this._page.$$eval(".inbox-dataList > ul > li:not(.hide)", mailListElement => {
            return mailListElement.map(mailNode => {
                return {
                    mailId: (<HTMLAnchorElement>mailNode.querySelector(".viewLink.title-subject")).dataset.mailId,
                    sender: mailNode.querySelector(".inboxSenderEmail")!.innerHTML,
                    subject: mailNode.querySelector(".viewLink.title-subject")!.innerHTML,
                    url: (<HTMLAnchorElement>mailNode.querySelector(".viewLink.title-subject")).href
                };
            });
        });

        return emailList;
    }

    async getEmailCount() {
        const mailListElement = await this._page.$(".inbox-dataList");
        if (!mailListElement)
            return 0;
            
        const count = await this._page.$eval(".inbox-dataList > ul", mailListElement => mailListElement.children.length)
        return count-1;
    }
};

export {TempEmail as email};