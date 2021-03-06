import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { EffectStep } from "./effect";
import { rxPubSub } from "./rxPubSub";
import { TimeLinePage } from "./timeline";

// function create<T>(c: { new(): T }): T {
//     return new c();
// }

export type Newable<T> = { new(...args: any[]): T; };


export class LightDesignPage extends foPage {
    timeCode: number = 0;
    currentEffect: EffectStep;


    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();

        rxPubSub.hub$().subscribe(item => {
            this.currentEffect = item.data;
            this.markAsDirty();
        })
    }

    addLightArray(item: LightArray<LEDLight>): LightDesignPage {
        this.subcomponents.addMember(item);
        this.markAsDirty();
        return this;
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foPage {
        super.render(ctx, deep)

        if (this.currentEffect != null) {
            ctx.save();

            ctx.fillStyle = this.currentEffect.color;
            ctx.fillRect(0, 0, this.width, this.gridSizeY/3);

            ctx.restore();   
        }
        //console.log(performance.now())
        return this.markAsClean();
    }
}

export class LEDLight extends foShape2D {
    color: string = 'blue';
    opacity: number = 0.3;
    _width: number = 50;
    _height: number = 50;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }
}



export interface ILightArray2DProperties extends IfoShape2DProperties {
    total?: number;
    groupId?: number;
}

export class LightArray<T extends LEDLight> extends foShape2D implements ILightArray2DProperties {
    opacity: number = 0.2;
    total: number;
    groupId: number;
    source: TimeLinePage;
    private _rebuild: any;


    constructor(properties?: ILightArray2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinTop();
    }

    applyEffect(step: EffectStep) {
        this.subcomponents.forEach(child => {
            child.color = step.color;
        })
    }

    setSource(obj:TimeLinePage): LightArray<T> {
        this.source = obj;

        this.source.pubsub.hub$().subscribe(item => {
            if (item.data) {
                this.applyEffect(item.data);
            }
        })
        return this;
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
