import { foCollection } from "foundry/models/foCollection.model";
import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { Effect } from "./effect";
import { rxPubSub } from "./rxPubSub";

interface ITimeTracker {
    timeStepCounts: number;
    timeScale: number;
    offsetTime: number; 
    currentTime: number; 
    offsetSteps(): number;
}

export class TimeTracker extends foObject implements ITimeTracker {
    timeStepCounts: number;
    timeScale: number;
    offsetTime: number = 0;
    currentTime: number;

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
        this.override(properties);
    }

    offsetSteps(): number {
        return 0;
    }

    setTimecode(globalTimeCode: number, globalTime: number) {

    }
}

export class TimeLinePage extends foPage {
    groupId: number = 0;
    timeTrack: TimeTracker = new TimeTracker();

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }

    canvasParams(title: string='') {
        const label = `Group ${this.groupId}`;
        const canvasParams = {
            width: this.width,
            height: this.height,
            title: `${label}: ${title}`,
            draw: (ctx: CanvasRenderingContext2D) => {
                this.isDirty && this.render(ctx);
            }
        }

        return canvasParams;
    }


    addEffect(item: Effect<TimeStep>): TimeLinePage {
        item.groupId = this.groupId;
        this.subcomponents.addMember(item);
        //item.computeTimeBoundry(this.timeDelay)
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
        let x = this.gridSizeX * this.timeTrack.offsetSteps();
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


    setTimecode(globalTimeCode: number, globalTime: number) {
        this.timeTrack.setTimecode(globalTimeCode, globalTime)
        // if (this.timeCode > this.width / this.gridSizeX) {
        //     this.timeCode = 0;
        // }
        this._subcomponents?.forEach(item => {
            const step = item as Effect<TimeStep>;
            step.setTimecode(globalTime, globalTime);
        });

        this._subcomponents?.forEach(item => {
            const step = item as Effect<TimeStep>;

                //console.log(step.activeStep.color, this.timeCode, this._subcomponents.length)
            //only broadcase if the value change for active step
            //including NO active step

            rxPubSub.broadcast({
                groupId: this.groupId,
                data: step.activeStep
            })

        })
        return this.markAsDirty();
    }
}


export class GlobalClock extends foObject {
    _timer: any = undefined;
    timeDelay: number = 10;
    timeCode: number = 0;

    protected _subcomponents: foCollection<TimeLinePage>;
    get subcomponents(): foCollection<TimeLinePage> {
        if (!this._subcomponents) {
            this._subcomponents = new foCollection<TimeLinePage>()
        }
        return this._subcomponents;
    }

    addTimeLinePage(item: TimeLinePage): GlobalClock {
        this.subcomponents.addMember(item);
        item.markAsDirty();
        return this;
    }

    notifyComponents(globalTimeCode: number, globalTime: number) {
        this.subcomponents.forEach(item => {
            item.setTimecode(globalTimeCode, globalTime);
            item.markAsClean();
        });
    }

    markAsClean() {
        this.subcomponents.forEach(item => {
            item.markAsClean();
        });
    }

    start() {
        this._timer = setTimeout(() => {
            if (!!(this._timer && !(this._timer % 2))) {
                this.timeCode++;
                this.notifyComponents(this.timeCode, this.timeDelay * this.timeCode);
            }
            clearTimeout(this._timer);
            this.start();
        }, this.timeDelay);

        return this;
    }

    stop() {
        this._timer && clearTimeout(this._timer);
        this._timer = undefined;
        this.markAsClean();
    }
}

export let SharedTimer: GlobalClock = new GlobalClock();



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



