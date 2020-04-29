import { MessageDataFields, MessageType } from "../types/socket"

export function constructInfoMessage(message: string) {
    let x: MessageDataFields = {type: MessageType.MESSAGE};
    x.data = {message};
    return x;
}

export function constructSuccessMessage(username: string, password: string) {
    let x: MessageDataFields = {type: MessageType.FINISHED_SUCCESS};
    x.data = {username, password};
    return x;
}

export function constructFailureMessage(message: string) {
    let x: MessageDataFields = {type: MessageType.FINISHED_FAILURE};
    x.data = {message};
    return x;
}