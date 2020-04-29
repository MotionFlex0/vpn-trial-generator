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
        await this._page.goto("http://temp-mail.org/")
        this._email = await this._page.$eval("#mail", mailElement => (<HTMLInputElement>mailElement).value)
    }

    async close() {
        await this._page.close();
    }

    async getEmailCount() {
        await this.gotoIfNot("https://temp-mail.org/");

        const mailListElement = await this._page.$(".inbox-dataList");
        if (!mailListElement)
            return 0;
            
        const count = await this._page.$eval(".inbox-dataList > ul", mailListElement => mailListElement.children.length)
        return count-1;
    }

    async getEmailContent(mailId: string) { 
        const mailUrl = `https://temp-mail.org/en/view/${mailId}`;
        await this.gotoIfNot(mailUrl);
        const emailContent = await this._page.$eval(".inbox-data-content", emailContentElement => {
            return {
                mailId: "",
                content: emailContentElement.querySelector(".inbox-data-content-intro")!.innerHTML,
                dateTime: emailContentElement.querySelector(".user-data-time-data")!.innerHTML,
                sender: emailContentElement.querySelector(".from-email")!.innerHTML.replace(/(^")|("$)/g, ""),
                senderName: emailContentElement.querySelector(".from-name")!.innerHTML,
                subject: emailContentElement.querySelector(".user-data-subject > h4")!.innerHTML,
                url: ""
            };
        });
        
        emailContent.mailId = mailUrl;
        emailContent.url = mailUrl;

        return emailContent;
    }

    //returns {mailId, sender, subject, url}
    async getEmailList() {
        await this.gotoIfNot("https://temp-mail.org/");

        const count = await this.getEmailCount();
        if (count < 1)
            return undefined;
        
        const emailList = await this._page.$$eval(".inbox-dataList > ul > li:not(.hide)", mailListElements => {
            return mailListElements.map(mailNode => {
                return {
                    mailId: <string>((<HTMLAnchorElement>mailNode.querySelector(".viewLink.title-subject")).dataset.mailId),
                    sender: mailNode.querySelector(".inboxSenderEmail")!.innerHTML,
                    subject: mailNode.querySelector(".viewLink.title-subject")!.innerHTML,
                    url: (<HTMLAnchorElement>mailNode.querySelector(".viewLink.title-subject")).href
                };
            });
        });

        return emailList;
    }

    //Needs to be the exact URL, including / if root.
    private async gotoIfNot(url: string) {
        if (this._page.url() !== url) {
            console.log(`[gotoIfNot()]: navigating to [${url}] from [${this._page.url()}].`)
            await this._page.goto(url);
        }
    }
};

export {TempEmail as email};