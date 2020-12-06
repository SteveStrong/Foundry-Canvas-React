import { useRef, useEffect } from 'react';

const useCanvas = (draw) => {
  const canvasRef = useRef(null);

  const clear = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const border = (ctx) => {
    ctx.fillStyle = 'green';
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      clear(context);
      border(context);
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return canvasRef;
};

export default useCanvas;
