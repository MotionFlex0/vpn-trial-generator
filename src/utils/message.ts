import { MessageDataFields, MessageType } from "../types/socket"

export function constructInfoMessage(message: string) {
    let x: MessageDataFields = {type: MessageType.MESSAGE};
    x.data = {message};
    return x;
}