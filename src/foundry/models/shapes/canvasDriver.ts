import { PubSub } from '../foPubSub';
import { cPoint2D } from './foGeometry2D';

export class Screen2D {
  private _request: any;
  private stopped: boolean = true;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  //https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
  requestAnimation =
    window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  cancelAnimation = window.cancelAnimationFrame; // || window.mozCancelAnimationFrame;

  render: (context: CanvasRenderingContext2D) => void;

  public doAnimate = (): void => {
    this.render(this.context);
    this._request = this.requestAnimation(this.doAnimate);
  }

  go(next?: () => {}) {
    this.stopped = false;
    this.doAnimate();
    next && next();
  }

  stop(next?: () => {}) {
    this.stopped = true;
    this.cancelAnimation(this._request);
    next && next();
  }

  toggleOnOff(): boolean {
    this.stopped ? this.go() : this.stop();
    return this.stopped;
  }

  clear() {
    this.context &&
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resizeRoot(width: number, height: number): HTMLCanvasElement{
    // set the width and height
    if ( this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    return this.canvas;
  }

  setRoot(
    nativeElement: HTMLCanvasElement,
    width: number,
    height: number
  ): HTMLCanvasElement {
    this.canvas = nativeElement;
    this.context = this.canvas.getContext('2d');

    // set the width and height
    this.resizeRoot(width, height);


    // set some default properties about the line
    this.context.lineWidth = 1;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';

    this.pubMouseEvents(nativeElement);

    return nativeElement;
  }

  pubMouseEvents(canvas: HTMLCanvasElement) {
    let rect = canvas.getBoundingClientRect();
    let win = window;
    let pt = new cPoint2D();

    function getMousePos(event: MouseEvent): cPoint2D {
      let x = rect.left - win.scrollX;
      let y = rect.top - win.scrollY;
      return pt.setValues(event.clientX - x, event.clientY - y);
    }


    function getKeys(e: KeyboardEvent) {
      let keys = {
        code: e.keyCode,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey
      };
      return keys;
    }
    canvas.ownerDocument.addEventListener('keypress', (e: KeyboardEvent) => {
      //e.preventDefault();
      let keys = getKeys(e);
      PubSub.Pub('onkeypress', e, keys);
    });

    canvas.ownerDocument.addEventListener('keydown', (e: KeyboardEvent) => {
      //e.preventDefault();
      let keys = getKeys(e);
      PubSub.Pub('onkeydown', e, keys);
    });

    canvas.ownerDocument.addEventListener('keyup', (e: KeyboardEvent) => {
      //e.preventDefault();
      let keys = getKeys(e);
      PubSub.Pub('onkeyup', e, keys);
    });

    function getButton(e: MouseEvent) {
      let keys = {
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        button: e.button
      };
      return keys;
    }

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('mousedown', loc, e, keys);
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('mousemove', loc, e, keys);
    });

    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);

      let scale = 1.1;
      let zoom =
        Math.max(-1, Math.min(1, e.deltaX || -e.detail)) > 0
          ? scale
          : 1 / scale;

      let g = new cPoint2D(e.offsetX, e.offsetY);

      PubSub.Pub('wheel', loc, g, zoom, e, keys);
    });

    canvas.addEventListener('dblclick', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('dblclick', loc, e, keys);
    });

    canvas.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('click', loc, e, keys);
    });

    canvas.addEventListener('mouseup', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('mouseup', loc, e, keys);
    });

    canvas.addEventListener('mouseover', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('mouseover', loc, e, keys);
    });

    canvas.addEventListener('mouseout', (e: MouseEvent) => {
      e.preventDefault();
      let loc = getMousePos(e);
      let keys = getButton(e);
      PubSub.Pub('mouseout', loc, e, keys);
    });
  }
}
