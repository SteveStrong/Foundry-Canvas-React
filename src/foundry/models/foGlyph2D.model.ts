import { Tools } from './foTools';
import { cPoint2D, cFrame } from './foGeometry2D';
import { Matrix2D } from './foMatrix2D';

import { iPoint2D, iRect, iFrame } from './foInterface';


import { Lifecycle } from './foLifecycle';


import { foObject } from './foObject.model';


export interface IfoGlyph2DProperties {
  opacity?: number;
  isSelected?: boolean;
  color?: string;

  x?: number;
  y?: number;
  width?: number;
  height?: number; 
  [propName: string]: any;
}

// a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph2D extends foObject implements IfoGlyph2DProperties {

  public opacity: number = 1.0;
  public isSelected: boolean = false;
  public color: any;

  protected _x: number;
  protected _y: number;
  protected _width: number;
  protected _height: number;

  constructor(properties?: IfoGlyph2DProperties, parent?: foObject) {
    super(properties, parent);

    this.override(properties);
  }

  get x(): number {
    return this._x || 0.0;
  }
  set x(value: number) {
    this.smash();
    this._x = value;
  }
  get y(): number {
    return this._y || 0.0;
  }
  set y(value: number) {
    this.smash();
    this._y = value;
  }

  get width(): number {
    return this._width || 0.0;
  }
  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height || 0.0;
  }
  set height(value: number) {
    this._height = value;
  }

  public rotationZ = (): number => {
    return 0;
  };

  public doubleClick: (keys: any) => void;

  public openEditor: () => void;
  public closeEditor: () => void;
  public drawHover: (ctx: CanvasRenderingContext2D) => void;
  public setupHoverEnterDraw: () => void;
  public setupHoverExitDraw: () => void;
  public setupOverlapEnterDraw: () => void;
  public setupOverlapExitDraw: () => void;

  public sendKeys: (e: KeyboardEvent, keys: any) => void;
  public preDraw: (ctx: CanvasRenderingContext2D) => void;
  public postDraw: (ctx: CanvasRenderingContext2D) => void;

  protected _matrix: Matrix2D;
  protected _invMatrix: Matrix2D;
  smash() {
    //console.log('smash matrix')
    this._matrix = undefined;
    this._invMatrix = undefined;
  }

  computeBoundry(frame: cFrame): cFrame {
    const mtx = this.getGlobalMatrix();
    //this is a buffer so we create less garbage
    const pt = frame.point;
    frame.init(mtx.transformPoint(0, 0, pt));
    frame.minmax(mtx.transformPoint(0, this.height, pt));
    frame.minmax(mtx.transformPoint(this.width, 0, pt));
    frame.minmax(mtx.transformPoint(this.width, this.height, pt));
    return frame;
  }

  protected _boundry: cFrame = new cFrame(this);
  get boundryFrame(): cFrame {
    this.computeBoundry(this._boundry);


    return this._boundry;
  }

  public drawBoundry(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    this.boundryFrame.draw(ctx, false);
    ctx.stroke();
  }



  is2D() {
    return true;
  }

  set(x: number, y: number, width: number, height: number): iRect {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  contains(x: number, y: number): boolean {
    return (
      this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height
    );
  }

  localContains(x: number, y: number): boolean {
    return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    });
  }

  public initialize(
    x: number = Number.NaN,
    y: number = Number.NaN,
    ang: number = Number.NaN
  ) {
    return this;
  }

  public didLocationChange(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ): boolean {
    let changed = false;
    if (!Number.isNaN(x) && this.x !== x) {
      changed = true;
      this.x = x;
    }

    if (!Number.isNaN(y) && this.y !== y) {
      changed = true;
      this.y = y;
    }

    return changed;
  }

  public easeToNoLifecycle(x: number, y: number) {
    this.initialize(x, y);
    return this;
  }

  // public easeToNoLifecycle(
  //   x: number,
  //   y: number,
  //   time: number = 0.5,
  //   ease: any = Back.easeInOut
  // ) {
  //   TweenLite.to(this, time, {
  //     x: x,
  //     y: y,
  //     ease: ease
  //     // }).eventCallback("onUpdate", () => {
  //     //     this.drop();
  //   }).eventCallback('onComplete', () => {
  //     this.initialize(x, y);
  //   });

  //   return this;
  // }

  // public easeTo(x: number, y: number) {
  //   this.initialize(x, y);
  //   return this;
  // }

  // public easeTo(
  //   x: number,
  //   y: number,
  //   time: number = 0.5,
  //   ease: any = Back.easeInOut
  // ) {
  //   TweenLite.to(this, time, {
  //     x: x,
  //     y: y,
  //     ease: ease
  //   })
  //     .eventCallback('onUpdate', () => {
  //       this.move();
  //     })
  //     .eventCallback('onComplete', () => {
  //       this.dropAt(x, y);
  //       Lifecycle.easeTo(this, this.getLocation());
  //     });

  //   return this;
  // }

  public easeTween(to: any, time: number = 0.5) {
    Lifecycle.easeTween(this, { time, undefined, to });
    return this;
  }

  // public easeTween(to: any, time: number = 0.5, ease: any = 'ease') {
  //   const from = Tools.union(to, { ease: Back[ease] });

  //   TweenLite.to(this, time, from).eventCallback('onComplete', () =>
  //     this.override(to)
  //   );
  //   Lifecycle.easeTween(this, { time, ease, to });
  //   return this;
  // }

  public dropAt(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ) {
    if (this.didLocationChange(x, y, angle)) {
      Lifecycle.dropped(this, this.getLocation());
    }
    return this;
  }

  public move(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ) {
    if (this.didLocationChange(x, y, angle)) {
      Lifecycle.moved(this, this.getLocation());
    }
    return this;
  }

  public moveTo(loc: iPoint2D, offset?: iPoint2D) {
    const x = loc.x + (offset ? offset.x : 0);
    const y = loc.y + (offset ? offset.y : 0);
    return this.move(x, y);
  }

  public moveBy(loc: iPoint2D, offset?: iPoint2D) {
    const x = this.x + loc.x + (offset ? offset.x : 0);
    const y = this.y + loc.y + (offset ? offset.y : 0);
    return this.move(x, y);
  }

  updateContext(ctx: CanvasRenderingContext2D) {
    const mtx = this.getMatrix();
    ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
    ctx.globalAlpha *= this.opacity;
  }

  getGlobalMatrix() {
    const mtx = new Matrix2D(this.getMatrix());
    const parent:foGlyph2D = this.myParent && this.myParent() as foGlyph2D;
    if (parent) {
      mtx.prependMatrix(parent.getGlobalMatrix());
    }
    return mtx;
  }

  getMatrix() {
    if (this._matrix === undefined) {
      this._matrix = new Matrix2D();
      this._matrix.appendTransform(this.x, this.y, 1, 1, 0, 0, 0, 0, 0);
    }
    return this._matrix;
  }

  getInvMatrix() {
    if (this._invMatrix === undefined) {
      this._invMatrix = this.getMatrix().invertCopy();
    }
    return this._invMatrix;
  }

  localToGlobal(x: number, y: number, pt?: cPoint2D) {
    const mtx = this.getGlobalMatrix();
    return mtx.transformPoint(x, y, pt);
  }

  localToGlobalPoint(pt: cPoint2D): cPoint2D {
    const mtx = this.getGlobalMatrix();
    return mtx.transformPoint(pt.x, pt.y, pt);
  }

  globalToLocal(x: number, y: number, pt?: cPoint2D): cPoint2D {
    const inv = this.getGlobalMatrix().invertCopy();
    return inv.transformPoint(x, y, pt);
  }

  globalToLocalPoint(pt: cPoint2D): cPoint2D {
    const inv = this.getGlobalMatrix().invertCopy();
    return inv.transformPoint(pt.x, pt.y, pt);
  }

  globalToLocalFrame(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    frame?: cFrame
  ): cFrame {
    frame = frame || new cFrame();
    const inv = this.getGlobalMatrix().invertCopy();

    frame.init(inv.transformPoint(x1, y1, frame.point));
    frame.minmax(inv.transformPoint(x1, y2, frame.point));
    frame.minmax(inv.transformPoint(x2, y1, frame.point));
    frame.minmax(inv.transformPoint(x2, y2, frame.point));
    return frame;
  }

  localToLocal(
    x: number,
    y: number,
    target: foGlyph2D,
    pt?: cPoint2D
  ): cPoint2D {
    pt = this.localToGlobal(x, y, pt);
    return target.globalToLocal(pt.x, pt.y, pt);
  }

  globalCenter(): cPoint2D {
    const { x, y } = this.pinLocation();
    const mtx = this.getGlobalMatrix();
    return mtx.transformPoint(x, y);
  }

  public isDragable = (): boolean => {
    return true;
  };

  public getOffset = (loc: iPoint2D): iPoint2D => {
    const x = this.x;
    const y = this.y;
    return new cPoint2D(x - loc.x, y - loc.y);
  };

  public getLocation = (): any => {
    return {
      x: this.x,
      y: this.y,
      z: 0
    };
  };

  public pinLocation(): any {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  public setLocation = (loc?: iPoint2D) => {
    this.x = loc ? loc.x : 0;
    this.y = loc ? loc.y : 0;
  };

  protected localHitTest = (hit: iPoint2D): boolean => {
    const { x, y } = hit;
    const loc = this.globalToLocal(x, y);

    if (loc.x < 0) return false;
    if (loc.x > this.width) return false;

    if (loc.y < 0) return false;
    if (loc.y > this.height) return false;
    return true;
  };

  public hitTest = (hit: iPoint2D): boolean => {
    return this.isHitable && this.isVisible && this.localHitTest(hit);
  };

  public overlapTest = (hit: iFrame): boolean => {
    const frame = this.globalToLocalFrame(hit.x1, hit.y1, hit.x2, hit.y2);

    if (this.localContains(frame.x1, frame.y1)) return true;
    if (this.localContains(frame.x1, frame.y2)) return true;
    if (this.localContains(frame.x2, frame.y1)) return true;
    if (this.localContains(frame.x2, frame.y2)) return true;
    return false;
  };

  // findObjectUnderPoint(hit: iPoint2D, deep: boolean): foGlyph2D {
  //   let found: foGlyph2D = this.hitTest(hit) ? this : undefined;

  //   if (deep) {
  //     const child = this.findChildObjectUnderPoint(hit);
  //     found = child ? child : found;
  //   }
  //   return found;
  // }






  public afterRender = (
    ctx: CanvasRenderingContext2D,
    deep: boolean = true
  ) => {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'pink';
    this.drawBoundry(ctx);
    ctx.restore();

    // deep &&
    //   this.nodes.forEach(item => {
    //     item.afterRender(ctx, deep);
    //   });
  };

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true): foGlyph2D {
    if (this.isInvisible) return;
    ctx.save();

    //this.drawOrigin(ctx);
    this.updateContext(ctx);
    //this.drawOriginX(ctx);

    this.preDraw && this.preDraw(ctx);
    this.draw(ctx);
    this.drawHover && this.drawHover(ctx);
    this.postDraw && this.postDraw(ctx);

    //this.isSelected && this.drawSelected(ctx);

    // deep &&
    //   this.nodes.forEach(item => {
    //     item.render(ctx, deep);
    //   });

    ctx.restore();
    return this;
  }

  public drawFont(
    ctx: CanvasRenderingContext2D,
    size: number = 20,
    fontFamily: string = 'Arial',
    align: any = 'center',
    base: any = 'middle'
  ) {
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.font = `${size}px ${fontFamily}`;
  }

  //https://stackoverflow.com/questions/6061880/html5-canvas-circle-text

  public drawTextCircle = (
    ctx: CanvasRenderingContext2D,
    text: string,
    radius: number = 100,
    start: number = Math.PI / 2,
    x: number = 0,
    y: number = 0
  ): void => {
    if (text) {

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(x, y);
      ctx.rotate(start - Math.PI / 2);

      let len = text.length;
      for (let i = 0; i < len; i++) {
        let s = text[i];
        let letterAngle = 0.5 * (ctx.measureText(s).width / radius);

        ctx.rotate(letterAngle);
        ctx.save();

        ctx.translate(0, -radius);
        ctx.fillText(s, 0, 0);
        ctx.restore();

        ctx.rotate(letterAngle);
      }
      ctx.restore();
    }
  };

  public drawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number = 0,
    y: number = 0
  ): void => {
    if (text) {
      ctx.fillText(text, x, y);
    }
  };

  public drawPin(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pinLocation();

    ctx.save();
    ctx.beginPath();

    ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'pink';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.restore();
  }

  public drawOrigin(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pinLocation();

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x - 50, y);
    ctx.lineTo(x + 50, y);
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x, y + 50);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.restore();
  }

  public drawOriginX(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pinLocation();

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x - 50, y - 50);
    ctx.lineTo(x + 50, y + 50);
    ctx.moveTo(x + 50, y - 50);
    ctx.lineTo(x - 50, y + 50);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.restore();
  }

  public drawHighlight(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 4;
    this.drawOutline(ctx);
    ctx.restore();
  }

  public drawHighlightOverlap(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 8;
    this.drawOutline(ctx);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 4;
    this.drawOutline(ctx);
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
    //this.drawHandles(ctx);
    this.drawPin(ctx);
  };

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.fillRect(0, 0, this.width, this.height);
  };

  toggleSelected() {
    this.isSelected = !this.isSelected;
  }

  // layoutSubcomponentsVertical(resize: boolean = true, space: number = 0) {
  //   let loc = this.getLocation() as cPoint2D;
  //   const self = this;

  //   if (resize) {
  //     self.height = self.width = 0;
  //     loc.x = loc.y = 0;
  //   } else {
  //     loc = this.nodes.first().getLocation() as cPoint2D;
  //   }

  //   this.nodes.forEach(item => {
  //     item.setLocation(loc);
  //   });

  //   this.nodes.forEach(item => {
  //     const { x: pinX, y: pinY } = item.pinLocation();
  //     loc.x = resize ? pinX : loc.x;
  //     loc.y += pinY;
  //     item.easeToNoLifecycle(loc.x, loc.y);
  //     loc.y += space + item.height - pinY;

  //     if (resize) {
  //       self.width = Math.max(self.width, item.width);
  //       self.height = loc.y;
  //     }
  //   });

  //   Lifecycle.layout(this, {
  //     method: 'layoutSubcomponentsVertical',
  //     resize,
  //     space
  //   });
  //   return this;
  // }

  // layoutSubcomponentsHorizontal(resize: boolean = true, space: number = 0) {
  //   let loc = this.getLocation() as cPoint2D;
  //   const self = this;

  //   if (resize) {
  //     self.height = self.width = 0;
  //     loc.x = loc.y = 0;
  //   } else {
  //     loc = this.nodes.first().getLocation() as cPoint2D;
  //   }

  //   this.nodes.forEach(item => {
  //     item.setLocation(loc);
  //   });

  //   this.nodes.forEach(item => {
  //     const { x: pinX, y: pinY } = item.pinLocation();
  //     loc.x += pinX;
  //     loc.y = resize ? pinY : loc.y;
  //     item.easeToNoLifecycle(loc.x, loc.y);
  //     loc.x += space + item.width - pinX;

  //     if (resize) {
  //       self.width = loc.x;
  //       self.height = Math.max(self.height, item.height);
  //     }
  //   });

  //   Lifecycle.layout(this, {
  //     method: 'layoutSubcomponentsHorizontal',
  //     resize,
  //     space
  //   });
  //   return this;
  // }

  // 


  // layoutMarginTop(resize: boolean = false, space: number = 0) {
  //   const loc = this.getLocation() as cPoint2D;
  //   const self = this;

  //   loc.x = 10;
  //   loc.y = space + this.height;

  //   this.nodes.forEach(item => {
  //     const { x: pinX, y: pinY } = item.pinLocation();
  //     loc.y += pinY;
  //     item.easeToNoLifecycle(loc.x + pinX, loc.y);
  //     loc.y += space + item.height - pinY;

  //     if (resize) {
  //       self.width = Math.max(self.width, item.width);
  //       self.height = loc.y;
  //     }
  //   });
  //   Lifecycle.layout(this, { method: 'layoutMarginTop', resize, space });
  //   return this;
  // }
}



