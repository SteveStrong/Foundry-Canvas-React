

import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D } from "foundry/models/foShape2D.model";


export class Walker extends foObject {
    cycles: number = 1; // 1 means the full length,  2 means 1/2 for first cycle
    invert: boolean = false;
}

export class WalkerShape extends foShape2D {
    color: string = 'tan';
    opacity: number = 0.3;
    walker: Walker;
}

export class WalkerDesignPage extends foPage {
    
    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    addWalker(item: WalkerShape): WalkerDesignPage {
        this.subcomponents.addMember(item);
        this.markAsDirty();
        return this;
    }
}


