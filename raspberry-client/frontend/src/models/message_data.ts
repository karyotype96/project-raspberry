export class Message {
    sender: string;
    message: string;

    constructor(message: string){
        let messageParts = message.split("\n");

        this.sender = messageParts[0];
        this.message = messageParts[1];
    }
}