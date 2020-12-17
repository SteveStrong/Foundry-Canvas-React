import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { rxPubSub } from "./rxPubSub";
import { ITimeLine2DProperties, TimeLine, TimeStep, TimeTracker } from "./timeline";


export class EffectStep extends TimeStep {
    color: string = 'tan';


    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinLeft().setPinTop();
    }
}






export class Effect<T extends EffectStep> extends TimeLine<T> implements ITimeLine2DProperties {
    timeTrack: TimeTracker = new TimeTracker();
    // timeCode: number = 0;
    // absTimeStart: number = 0; // ms
    // absTimeSpan: number = 0; // ms
    // absTimeEnd: number = 0; // ms
    activeStep: T;

    constructor(properties?: ITimeLine2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    _currentTime: number;
    currentTime(): number {
        return this._currentTime;
    }

    _currentStep: number;
    currentStep(): number {
        return this._currentStep;
    }

    setTimecode(globalTimeCode: number, globalTime: number) {
        this._currentStep = globalTimeCode - this.timeTrack.offsetStep;
        this._currentTime = globalTime - this.timeTrack.offsetTime;
    }

    computeTimeBoundry(deltaTime: number) {
        const item = this.subcomponents.first();
        // this.absTimeStart = deltaTime * (this.x / item.width);
        // this.absTimeSpan = deltaTime * this.subcomponents.length;
        // this.absTimeEnd = this.absTimeStart + this.absTimeSpan;
    }

    computeActiveStep(absTime: number): T {
        const members = this.subcomponents.members;
        // const deltaTime = this.absTimeSpan / members.length;
        // const localTime = absTime - this.absTimeStart;
        // const step = localTime / deltaTime;
        // const item = members[step-1];
        // this.activeStep = item as T;
        return this.activeStep;
    }

    setX(x: number) {
        this.x = x;
        return this;
    }

    followEffect(source: Effect<T>) {
        this.x = source.x + source.width;
        return this;
    }

    // setTimecode(absTime: number, code: number) {
    //     if (absTime >= this.absTimeStart && absTime <= this.absTimeEnd) {
    //         this.timeCode = code;
    //         this.computeActiveStep(absTime);
    //     } else {
    //         this.timeCode = -1;
    //         this.activeStep = undefined;
    //     }
    //     return this;
    // }

    public drawLabel = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;

        let x = this.width / 2;
        let y = this.height - 10;

        ctx.font = '40px serif';
        this.drawText(ctx, `label: ${this.timeTrack.currentTime()}`, x, y);

        ctx.restore();
    }
    
    public draw = (ctx: CanvasRenderingContext2D): void => {
        
        ctx.save();

        this.drawLabel(ctx);

        ctx.restore();
    }
}

