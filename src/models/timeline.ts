import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { Effect } from "./effect";

export interface ITimeSpec {
    timeScale: number;
    startStep: number;
    totalSteps: number;
}

export interface ITimeTracker extends ITimeSpec {
    timeScale: number;
    startStep: number;
    totalSteps: number;

    currentTime(): number;
    currentStep(): number;
}



export class TimeTracker extends foObject implements ITimeTracker {
    timeScale: number = 1;
    startStep: number = 0;
    totalSteps: number = 1;

    _isWithinBoundary: boolean = false;

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
        this.override(properties);
    }


    setSpec(spec: ITimeSpec): TimeTracker {
        this.timeScale = spec.timeScale;
        this.startStep = spec.startStep;
        this.totalSteps = spec.totalSteps;
        return this;
    }

    get startTime(): number {
        return this.startStep * this.timeScale;
    }

    get endTime(): number {
        return this.endStep * this.timeScale;
    }

    get endStep(): number {
        return (this.startStep + this.totalSteps);
    }


    get isWithinBoundary(): boolean {
        return this._isWithinBoundary;
    }

    private _currentTime: number;
    currentTime(): number {
        return this._currentTime;
    }

    private _currentStep: number;
    currentStep(): number {
        return this._currentStep;
    }

    setTimecode(globalStep: number, globalTime: number) {
        this._currentStep = globalStep - this.startStep;
        this._currentTime = globalTime - this.startTime;

        this._isWithinBoundary = false;
        if (this._currentStep > 0 && this._currentStep < this.totalSteps) {
            this._isWithinBoundary = true;
        }

    }
}

export class TimeLinePage extends foPage {
    groupId: number = 0;
    stepWidth: number = 1;
    timeTrack: TimeTracker = new TimeTracker();

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }

    canvasParams(title: string = '') {
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
        this.markAsDirty();
        return this;
    }

    drawTimecode(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;

        const top = this.marginY - this.y;
        const height = this.height / this.scaleY;
        const bottom = top + height;

        //draw vertical...
        let x = this.timeTrack.currentStep() * this.stepWidth;
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);

        ctx.stroke();
        ctx.restore();
    }


    public drawLabel = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;

        let x = this.width / 2;
        let y = this.height - 10;

        ctx.font = '40px serif';
        this.drawText(ctx, `page: ${this.timeTrack.currentStep()}`, x, y);

        ctx.restore();
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
        //this.drawPage(ctx);
        //this.drawLabel(ctx);
        this.drawTimecode(ctx);
    }


    setTimecode(globalStep: number, globalTime: number) {
        this.timeTrack.setTimecode(globalStep, globalTime)

        this._subcomponents?.forEach(item => {
            const step = item as Effect<TimeStep>;
            step.setTimecode(globalStep, globalTime);
        });

        this._subcomponents?.forEach(item => {

            //console.log(step.activeStep.color, this.timeCode, this._subcomponents.length)
            //only broadcase if the value change for active step
            //including NO active step

            // rxPubSub.broadcast({
            //     groupId: this.groupId,
            //     data: step.activeStep
            // })

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



