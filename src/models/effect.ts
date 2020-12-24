import { foObject } from "foundry/models/foObject.model";
import { IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { SharedTimer } from "./globalClock";
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

    constructor(properties?: ITimeLine2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.timeTrack.totalSteps = this.total;
    }

    private setX(x: number) {
        this.x = x;
        return this;
    }

    setStepOffset(step: number): Effect<T> {
        this.timeTrack.setSpec({
            timeScale: SharedTimer.timeTrack.timeScale,
            startStep: step,
            totalSteps: this.total
        });
        const block = this.subcomponents.first();
        return this.setX(step * block.width);
    }

    setTimecode(globalStep: number, globalTime: number): Effect<T> {
        this.timeTrack.setTimecode(globalStep, globalTime);
        this.isSelected = this.timeTrack.isWithinBoundary;
        return this;
    }

    activeStep(): T {
        if ( this.isSelected ) {
            const id = this.timeTrack.currentStep();
            return this.subcomponents.getChildAt(id) as T;
        }
    }

    get endStep() {
        return this.timeTrack.endStep;
    }


    followEffect(source: Effect<T>): Effect<T> {
        return this.setStepOffset(source.endStep);
    }

    public drawLabel = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;

        let x = this.width / 2;
        let y = this.height - 10;


        ctx.font = '20px serif';


        this.drawText(ctx, `${this.timeTrack.startStep}=>${this.timeTrack.currentStep()}=>${this.timeTrack.endStep}`, x, y);

        ctx.restore();
    }

    // public draw = (ctx: CanvasRenderingContext2D): void => {

    //     ctx.save();

    //     this.drawLabel(ctx);

    //     ctx.restore();
    // }
}

