import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { rxPubSub } from "./rxPubSub";
import { ITimeLine2DProperties, SharedTimer, TimeLine, TimeStep, TimeTracker } from "./timeline";


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
    activeStep: T;

    constructor(properties?: ITimeLine2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }


    setTimeOffset(step: number, time?: number): Effect<T> {
        const realtime = time != undefined ? time : SharedTimer.computeTimeOffset(step);
        this.timeTrack.setTimeOffset(step, realtime);
        const block = this.subcomponents.first();
        return this.setX(step * block.width);
    }

    setTimecode(globalTimeCode: number, globalTime: number) {
        this.timeTrack.setTimecode(globalTimeCode, globalTime);
    }

    endTimeStep()
    {
        return this.timeTrack.offsetStep + this.subcomponents.length;
    }

    private setX(x: number) {
        this.x = x;
        return this;
    }

    followEffect(source: Effect<T>): Effect<T> {
        return this.setTimeOffset(source.endTimeStep());
    }

    public drawLabel = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;

        let x = this.width / 2;
        let y = this.height - 10;

        ctx.font = '40px serif';
        this.drawText(ctx, `effect: ${this.timeTrack.offsetTime}=>${this.timeTrack.currentTime()}`, x, y);

        ctx.restore();
    }
    
    public draw = (ctx: CanvasRenderingContext2D): void => {
        
        ctx.save();

        this.drawLabel(ctx);

        ctx.restore();
    }
}

