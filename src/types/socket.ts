export enum MessageType {
    GENERATE_CREDIENTIALS,
    STARTING,
    MESSAGE,
    CURRENT_PROGRESS,
    FINISHED_SUCCESS,
    FINISHED_FAILURE
}

export type MessageDataFields = {
    type: MessageType
    data?: {
        username?: string,
        password?: string,
        message?: string,
        progress?: number,
    }
} & {};