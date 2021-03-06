import { foObject } from './foObject.model';
import { foShape2D, IfoShape2DProperties } from './foShape2D.model';

export interface IfoPageProperties extends IfoShape2DProperties {
  marginX?: number;
  marginY?: number;
  showBoundry?: boolean;
}

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPage extends foShape2D implements IfoPageProperties {
  private _isDirty: boolean = true;
  gridSizeX: number = 50;
  gridSizeY: number = 50;
  showBoundry: boolean = true;


  constructor(
    properties?: IfoPageProperties,
    parent?: foObject
  ) {
    super(properties, parent);
    this.override(properties);
  }

  markAsDirty(): foPage {
    this._isDirty = true;
    return this;
  }
  markAsClean(): foPage {
    this._isDirty = false;
    return this;
  }

  get isDirty() {
    return this._isDirty;
  }


  protected _marginX: number;
  get marginX(): number {
    return this._marginX || 0.0;
  }
  set marginX(value: number) {
    this.smash();
    this._marginX = value;
  }

  protected _marginY: number;
  get marginY(): number {
    return this._marginY || 0.0;
  }
  set marginY(value: number) {
    this.smash();
    this._marginY = value;
  }

  protected _scaleX: number;
  get scaleX(): number {
    return this._scaleX || 1.0;
  }
  set scaleX(value: number) {
    this.smash();
    this._scaleX = value;
  }

  protected _scaleY: number;
  get scaleY(): number {
    return this._scaleY || 1.0;
  }
  set scaleY(value: number) {
    this.smash();
    this._scaleY = value;
  }


  mouseLoc: any = {};





  zoomBy(zoom: number) {
    this.scaleX *= zoom;
    this.scaleY *= zoom;
  }





  drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();

    ctx.setLineDash([5, 1]);
    ctx.strokeStyle = 'gray';

    const left = this.marginX - this.x;
    const top = this.marginY - this.y;
    const width = this.width / this.scaleX;
    const height = this.height / this.scaleY;
    const right = left + width;
    const bottom = top + height;

    //ctx.fillStyle = 'yellow';
    //ctx.fillRect(left,top, width, height);

    //draw vertical...
    let x = this.gridSizeX; //left;
    while (x < right) {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      x += this.gridSizeX;
    }
    x = -this.gridSizeX; //left;
    while (x > left) {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      x -= this.gridSizeX;
    }

    //draw horizontal...
    let y = this.gridSizeY; //top;
    while (y < bottom) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      y += this.gridSizeY;
    }

    y = -this.gridSizeY; //top;
    while (y > top) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      y -= this.gridSizeY;
    }

    ctx.stroke();
    ctx.restore();
  }

  drawAxis(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    const left = this.marginX - this.x;
    const top = this.marginY - this.y;
    const width = this.width / this.scaleX;
    const height = this.height / this.scaleY;
    const right = left + width;
    const bottom = top + height;

    //draw vertical...
    ctx.moveTo(0, top);
    ctx.lineTo(0, bottom);

    //draw horizontal...

    ctx.moveTo(left, 0);
    ctx.lineTo(right, 0);

    ctx.stroke();
    ctx.restore();
  }

  drawPage(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;

    //let left = this.marginX - this.x;
    //let top = this.marginY - this.y;
    //let width = this.width / this.scaleX;
    //let height = this.height / this.scaleY;
    //let right = left + width;
    //let bottom = top + height;

    //draw vertical...
    ctx.rect(0, 0, this.width, this.height);

    ctx.stroke();
    ctx.restore();
  }

  drawName(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '50pt Calibri';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'blue';
    ctx.strokeText(this.myName, 10, 50);
    ctx.restore();
  }





  public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foPage {
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    this.drawName(ctx);

    this.preDraw && this.preDraw(ctx);
    this.draw(ctx);
    //this.drawHover && this.drawHover(ctx);
    this.postDraw && this.postDraw(ctx);

    deep &&
      this._subcomponents?.forEach(item => {
        item.render(ctx, deep);
      });
    ctx.restore();

    this.showBoundry && this.afterRender(ctx);

    return this.markAsClean();
  }

  public preDraw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    this.drawGrid(ctx);
    this.drawAxis(ctx);
    this.drawPage(ctx);
    this.drawPin(ctx);
  }
}

