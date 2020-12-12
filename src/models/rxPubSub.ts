import { Subject } from 'rxjs';

export enum Topics {
    DOCUMENT_MODIFIED,
    VIEW_STATE_TOGGLED
}

class rxPubSubClass {
    private _subject = new Subject<Topics>();

    pubSub$(): Subject<Topics> {
        return this._subject;
    }

    broadcast(topic: Topics) {
        this._subject.next(topic);
    }
}

export let rxPubSub: rxPubSubClass = new rxPubSubClass();
