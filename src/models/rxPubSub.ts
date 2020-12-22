import { Subject } from 'rxjs';



export interface Message {
    groupId: number;
    data: any;
}

export class rxPubSubClass {
    private _subject = new Subject<Message>();

    hub$(): Subject<Message> {
        return this._subject;
    }

    broadcast(message: Message) {
        this._subject.next(message);
    }
}

export let rxPubSub: rxPubSubClass = new rxPubSubClass();
