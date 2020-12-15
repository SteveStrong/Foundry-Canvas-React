import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { rxPubSub } from "./rxPubSub";
import { ITimeLine2DProperties, TimeLine, TimeStep } from "./timeline";



enum WaveType {
    SIN,
    SQUARE,
    RAMP,
}

export class Wave extends foObject {
    cycles: number = 1; // 1 means the full length,  2 means 1/2 for first cycle
    
}

export class WaveShape extends foShape2D {
    color: string = 'tan';
    opacity: number = 0.3;
    wave: Wave;

    constructor(properties?: IfoShape2DProperties, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
        this.setPinCenter().setPinMiddle();
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foShape2D {
        if (this.isInvisible) return;
        ctx.save();

        //this.drawOrigin(ctx);
        this.updateContext(ctx);
        //this.drawOriginX(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        //this.postDraw && this.postDraw(ctx);

        this.isSelected && this.drawSelected(ctx);


        ctx.restore();
        return this;
    }

    public postDraw = (ctx: CanvasRenderingContext2D) => {

        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    };
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


