import { useRef, useEffect } from 'react';

export function useCanvas2D(draw: (arg0: CanvasRenderingContext2D, arg1: number) => void) {
  const canvasRef = useRef(null);

  const clear = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const border = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'green';
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  useEffect(() => {
    let animationFrameId: number = 0;
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context: CanvasRenderingContext2D = canvas.getContext('2d');

      const render = () => {
        clear(context);
        border(context);
        draw(context, animationFrameId);
       animationFrameId = window.requestAnimationFrame(render);
      };
      render();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return canvasRef;
}
