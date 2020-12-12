import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";

export class TimeLinePage extends foPage {
    timeCode: number = 0;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }
    drawTimecode(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();


        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;

        const left = this.marginX - this.x;
        const top = this.marginY - this.y;
        const width = this.width / this.scaleX;
        const height = this.height / this.scaleY;
        const bottom = top + height;


        //draw vertical...
        let x = this.gridSizeX * this.timeCode;
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);

        ctx.stroke();
        ctx.restore();
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
        //this.drawPage(ctx);
        this.drawTimecode(ctx);
    }

    setTimecode(code:number) {
        this.timeCode = code - 1;;
        return this.incrementTimecode();
    }

    incrementTimecode() {
        this.timeCode++;
        if (this.timeCode > this.width / this.gridSizeX) {
            this.timeCode = 0;
        }
        return this;
    }
}

export class TimeStep extends foShape2D {
    color: string = 'blue';
    opacity: number = 0.3;
    _width: number = 10;
    _height: number = 50;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }
}



export interface ITimeLine2DProperties extends IfoShape2DProperties {
    total?: number;
}

export class TimeLine<T extends TimeStep> extends foShape2D implements ITimeLine2DProperties {
    opacity: number = 0.2;
    total: number;
    private _rebuild: any;


    constructor(properties?: ITimeLine2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
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
                    x: i * (source.width),
                    y: 0,
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
                const led = new TimeStep({
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

export class Effect<T extends TimeStep> extends TimeLine<T> implements ITimeLine2DProperties {
    timeCode: number = 0;
    constructor(properties?: ITimeLine2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    setX(x: number) {
        this.x = x;
        return this;
    }

    followEffect(source: Effect<T>) {
        this.x = source.x + source.width;
        return this;
    }

    setTimecode(code: number) {
        this.timeCode = code;
        return this;
    }
}

