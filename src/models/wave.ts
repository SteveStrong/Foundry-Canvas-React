import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { single } from "rxjs/operators";
import { rxPubSub } from "./rxPubSub";
import { ITimeLine2DProperties, TimeLine, TimeStep } from "./timeline";



enum WaveType {
    SIN,
    SQUARE,
    RAMP,
}

export class Wave extends foObject {
    cycles: number = 1; // 1 means the full length,  2 means 1/2 for first cycle
    invert: boolean = false;
}

export class WaveShape extends foShape2D {
    color: string = 'tan';
    opacity: number = 0.3;
    wave: Wave;

    rads:number = Math.PI / 180;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinCenter().setPinMiddle();
    }


    public drawSinWave = (ctx: CanvasRenderingContext2D) => {

        ctx.moveTo(0, this.pinY());
        ctx.lineTo(this.width, this.pinY());

        let invert = 1;
        let phase = 0;
        let freq = 1;
        let amp = invert * this.height * 3 / 8;

        let length = (freq * 360);
        let factor = this.width / length;
        let shift = (this.width * phase) / length
        let max = length + phase + 10;

        for (let t = 0; t <= max; t += 10) {
            let x = t * factor - shift;

            let y = amp * Math.sin((this.rads * t)) + this.pinY();

            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawBackground(ctx);
        this.drawSinWave(ctx);
    }
        
    // public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foShape2D {
    //     if (this.isInvisible) return;
    //     ctx.save();

    //     //this.drawOrigin(ctx);
    //     this.updateContext(ctx);
    //     //this.drawOriginX(ctx);

    //     this.preDraw && this.preDraw(ctx);
    //     this.draw(ctx);
    //     this.drawPin(ctx);

    //     this.drawHover && this.drawHover(ctx);
    //     this.postDraw && this.postDraw(ctx);

    //     this.isSelected && this.drawSelected(ctx);

    //     ctx.restore();
    //     return this;
    // }
}


export class WaveDesignPage extends foPage {
    
    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foPage {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.save();

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.postDraw && this.postDraw(ctx);

        deep &&
            this._subcomponents?.forEach(item => {
                item.render(ctx, deep);
            });
        ctx.restore();


        return this.markAsClean();
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        this.drawGrid(ctx);
        //this.drawAxis(ctx);
        this.drawPage(ctx);
        //this.drawPin(ctx);
    }

    addWave(item: WaveShape): WaveDesignPage {
        this.subcomponents.addMember(item);
        this.markAsDirty();
        return this;
    }
}


