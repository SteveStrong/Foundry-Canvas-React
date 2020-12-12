import { Tools } from './foTools';
import { cPoint2D } from './foGeometry2D';
import { Vector2, Vector3 } from 'three';
import { iPoint2D, iFrame } from './foInterface';

import { foObject } from './foObject.model';
import { Matrix2D } from './foMatrix2D';

import { foGlyph2D, IfoGlyph2DProperties } from './foGlyph2D.model';

import { Lifecycle } from './foLifecycle';
import { foCollection } from './foCollection.model';

export enum shape2DNames {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
  center = 'center'
}

export interface IfoShape2DProperties extends  IfoGlyph2DProperties {
  angle?: number;
}

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape2D extends foGlyph2D implements IfoShape2DProperties {
  protected _angle: number;
  get angle(): number {
    return this._angle || 0.0;
  }
  set angle(value: number) {
    this.smash();
    this._angle = value;
  }

  protected _subcomponents: foCollection<foShape2D>;
  get subcomponents(): foCollection<foShape2D> {
    if (!this._subcomponents) {
      this._subcomponents = new foCollection<foShape2D>()
    }
    return this._subcomponents;
  }

  public pinX = (): number => 0.5 * this.width;
  public pinY = (): number => 0.5 * this.height;
  public rotationZ = (): number => this.angle;

  public setPinLeft() {
    this.pinX = (): number => 0.0 * this.width;
    return this;
  }
  public setPinRight() {
    this.pinX = (): number => 1.0 * this.width;
    return this;
  }
  public setPinCenter() {
    this.pinX = (): number => 0.5 * this.width;
    return this;
  }

  public setPinTop() {
    this.pinY = (): number => 0.0 * this.height;
    return this;
  }
  public setPinMiddle() {
    this.pinY = (): number => 0.5 * this.height;
    return this;
  }
  public setPinBottom() {
    this.pinY = (): number => 1.0 * this.height;
    return this;
  }

  pinVector(): Vector3 {
    return new Vector3(this.pinX(), this.pinY(), 0);
  }

  protected originPosition(): Vector3 {
    const pin = this.pinVector();
    return new Vector3(this.x - pin.x, this.y - pin.y, 0);
  }

  public pinLocation() {
    return {
      x: this.pinX(),
      y: this.pinY(),
      z: 0
    };
  }

  constructor(
    properties?: IfoShape2DProperties,
    parent?: foObject
  ) {
    super(properties, parent);
    this.override(properties);
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      angle: this.angle
      // glue: this._glue && Tools.asArray(this.glue.asJson)
    });
  }

  public didLocationChange(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ): boolean {
    let changed = super.didLocationChange(x, y, angle);
    if (!Number.isNaN(angle) && this.angle !== angle) {
      changed = true;
      this.angle = angle;
    }
    return changed;
  }





  public move(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ) {
    if (this.didLocationChange(x, y, angle)) {
      const point = this.getLocation();

      Lifecycle.moved(this, point);
    }
    return this;
  }

  updateContext(ctx: CanvasRenderingContext2D) {
    const mtx = this.getMatrix();
    ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
    ctx.globalAlpha *= this.opacity;
  }

  getMatrix() {
    if (this._matrix === undefined) {
      this._matrix = new Matrix2D();
      this._matrix.appendTransform(
        this.x,
        this.y,
        1,
        1,
        this.rotationZ(),
        0,
        0,
        this.pinX(),
        this.pinY()
      );
    }
    return this._matrix;
  }

  protected localHitTest = (hit: any): boolean => {
    const { x, y } = hit as iPoint2D;
    const loc = this.globalToLocal(x, y);

    if (loc.x < 0) return false;
    if (loc.x > this.width) return false;

    if (loc.y < 0) return false;
    if (loc.y > this.height) return false;

    return true;
  }

  public hitTest = (hit: any): boolean => {
    return this.isHitable && this.isVisible && this.localHitTest(hit);
  }

  public overlapTest = (hit: iFrame): boolean => {
    const frame = this.globalToLocalFrame(hit.x1, hit.y1, hit.x2, hit.y2);

    if (this.localContains(frame.x1, frame.y1)) return true;
    if (this.localContains(frame.x1, frame.y2)) return true;
    if (this.localContains(frame.x2, frame.y1)) return true;
    if (this.localContains(frame.x2, frame.y2)) return true;
    return false;
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
    this.postDraw && this.postDraw(ctx);

    this.isSelected && this.drawSelected(ctx);

    deep &&
      this._subcomponents?.forEach(item => {
        item.render(ctx, deep);
      });
    ctx.restore();
    return this;
  }

  public drawOutline(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.setLineDash([15, 5]);
    ctx.rect(0, 0, this.width, this.height);
    ctx.stroke();
  }

  public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    this.drawOutline(ctx);

    this.drawPin(ctx);
  }

  public drawBackground = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    this.drawBackground(ctx);
  }
}

