import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { rxPubSub } from "./rxPubSub";

// function create<T>(c: { new(): T }): T {
//     return new c();
// }

export type Newable<T> = { new(...args: any[]): T; };


export class LightDesignPage extends foPage {
    timeCode: number = 0;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();

        rxPubSub.hub$().subscribe(item => {
            if (item.data && item.data?.color) {
                this.markAsDirty();
                //console.log(item.data.color)
                this.subcomponents.forEach(child => {
                    child.color = item.data.color;
                })
            }
        })
    }

    addLightArray(item: LightArray<LEDLight>): LightDesignPage {
        this.subcomponents.addMember(item);
        this.markAsDirty();
        return this;
    }
}

export class LEDLight extends foShape2D {
    color: string = 'blue';
    opacity: number = 0.3;
    _width: number = 25;
    _height: number = 50;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }
}



export interface ILightArray2DProperties extends IfoShape2DProperties {
    total?: number;
}

export class LightArray<T extends LEDLight> extends foShape2D implements ILightArray2DProperties {
    opacity: number = 0.2;
    total: number;
    private _rebuild: any;


    constructor(properties?: ILightArray2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinTop();


    }

    clear() {
        this.subcomponents.clearAll();
    }
    resetSize(i: number) {
        this.total = i;
        this._rebuild && this._rebuild();
        return this;
    }
    horizontal(childType: { new(props?: IfoShape2DProperties): T }, props?: IfoShape2DProperties) {

        this._rebuild = () => { this.horizontal(childType, props) };
        if (this.subcomponents.length !== this.total) {
            const source = new childType(props);
            this.width = source.width * this.total;
            this.height = source.height;

            for (let i = 0; i < this.total; i++) {
                const led = new childType({
                    index: i,
                    x: i * (source.width) + (source.width / 2),
                    y: (source.height / 2),
                    ...props,
                });
                this.subcomponents.addMember(led);
            }
        }
        return this;
    }
    vertical(childType: { new(props?: IfoShape2DProperties): T }, props?: IfoShape2DProperties) {

        this._rebuild = () => { this.vertical(childType, props) };
        if (this.subcomponents.length !== this.total) {
            const source = new childType(props);
            this.width = source.width;
            this.height = source.height * this.total;

            for (let i = 0; i < this.total; i++) {
                const led = new childType({
                    index: i,
                    x: (source.width / 2),
                    y: i * (source.height) + (source.height / 2),
                    ...props,
                });
                this.subcomponents.addMember(led);
            }
        }
        return this;
    }

    colorRollDown() {
        const items = this.subcomponents.members
        const start = items[0].color;
        for (let i = 1; i < this.total; i++) {
            items[i - 1].color = items[i].color;
        }
        items[this.total - 1].color = start;
    }


    colorRollUp() {
        const items = this.subcomponents.members
        const last = this.total - 1
        const end = items[last].color;
        for (let i = last; i > 0; i--) {
            items[i].color = items[i - 1].color;
        }
        items[0].color = end;
    }
}

export class ColorArray<T extends LEDLight> extends LightArray<T> implements ILightArray2DProperties {
    colors: any[];

    constructor(properties?: ILightArray2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.total = this.colors.length;
    }

    horizontal(childType: { new(props?: IfoShape2DProperties): T }, props?: IfoShape2DProperties) {
        super.horizontal(childType, props);
        for (let i = 0; i < this.total; i++) {
            const item = this.subcomponents.getMember(i);
            item.color = this.colors[i];
        }
        return this;
    }
    vertical(childType: { new(props?: IfoShape2DProperties): T }, props?: IfoShape2DProperties) {
        super.vertical(childType, props);
        for (let i = 0; i < this.total; i++) {
            const item = this.subcomponents.getMember(i);
            item.color = this.colors[i];
        }
        return this;
    }

}
