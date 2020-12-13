import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { Effect } from "./effect";
import { rxPubSub } from "./rxPubSub";

export class TimeLinePage extends foPage {
    timeCode: number = 0;
    timeDelay: number = 10; // ms
    activeStep: TimeStep;
    _timer: any = undefined;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }

    start() {
        this._timer && clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            // console.log(this._timer, 'setTimeout');
            if (!!(this._timer && !(this._timer % 2))) {
                this.incrementTimecode();
            }
            this.start();
        }, this.timeDelay);
        return this;
    }

    stop() {
        this._timer && clearTimeout(this._timer);
        this._timer = undefined;
        this.markAsClean();
    }

    addEffect(item: Effect<TimeStep>): TimeLinePage {
        this.subcomponents.addMember(item);
        item.computeTimeBoundry(this.timeDelay)
        this.markAsDirty();
        return this;
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

    setTimecode(code: number) {
        this.timeCode = code - 1;;
        return this.incrementTimecode();
    }

    incrementTimecode() {
        this.timeCode++;
        if (this.timeCode > this.width / this.gridSizeX) {
            this.timeCode = 0;
        }
        const absTime = this.timeDelay * this.timeCode;
        this._subcomponents?.forEach(item => {
            const step = item as Effect<TimeStep>;
            step.setTimecode(absTime, this.timeCode);
        });

        this._subcomponents?.forEach(item => {
            const step = item as Effect<TimeStep>;
            this.activeStep = step.activeStep;
            if (step.activeStep != null) {
                //console.log(step.activeStep.color, this.timeCode, this._subcomponents.length)
                rxPubSub.broadcast({
                    groupId: item['groupId'],
                    data: step.activeStep
                })
            }
        })
        return this.markAsDirty();
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
    groupId?: number;
}

export class TimeLine<T extends TimeStep> extends foShape2D implements ITimeLine2DProperties {
    opacity: number = 1.0;
    total: number;
    groupId: number;
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



