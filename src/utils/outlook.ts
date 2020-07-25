import {IEmail} from "./iemail"

class Outlook extends IEmail {
    open(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    close(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getEmailCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    getEmailContent(mailId: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getEmailList(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    protected gotoIfNot(url: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}