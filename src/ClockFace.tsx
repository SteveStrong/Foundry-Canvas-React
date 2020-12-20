import { useCanvas2D } from 'CanvasHook';

import { TimeTracker } from 'models/timeline';
import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import { SharedTimer } from 'models/globalClock';
import { ToJSON } from './core/foRenderer';
import { foPage } from 'foundry/models/foPage.model';
import { foObject } from 'foundry/models/foObject.model';

export class ClockFacePage extends foPage {

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    drawTime = (ctx: CanvasRenderingContext2D, id:number) => {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let x = 10;
        let y = this.height/2;
        let timeTrack: TimeTracker = SharedTimer.timeTrack;

        ctx.font = '30px serif';
        let text = `${id} ${timeTrack.timeScale} every ${SharedTimer.timeTrigger} ms ::`;
        text += `${timeTrack.startStep}[${timeTrack.currentStep()}]${timeTrack.endStep}`;
        text += ` => ${timeTrack.startTime}[${timeTrack.currentTime()}]${timeTrack.endTime}`;
        ctx.fillText(text, x, y);

        ctx.restore();
    };

    public renderTime(ctx: CanvasRenderingContext2D, id: number): foPage {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.save();

        this.preDraw && this.preDraw(ctx);
        this.drawTime(ctx, id);
        this.postDraw && this.postDraw(ctx);

        ctx.restore();

        return this.markAsClean();
    }
}

const clock = new ClockFacePage({
    width: 600,
    height: 50,
    color: 'yellow'
});

export const ClockFace: FunctionComponent<any> = (): ReactElement => {
    const canvasRef = useCanvas2D(clock.renderTime.bind(clock));

    const props = {
        width: clock.width,
        height: clock.height
    };

    return (
        <Fragment>
            <canvas ref={canvasRef} {...props} />
            {/* <ToJSON {...props} /> */}
        </Fragment>
    );
};
