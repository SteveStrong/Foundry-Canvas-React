import React, { useRef, useEffect } from 'react';

const Canvas = (props) => {
  const canvasRef = useRef(null);

    const clear = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    
  const draw = (ctx) => {
    ctx.fillStyle = '#0000FF';
    ctx.beginPath();
    ctx.arc(15, 50, 20, 0, 2 * Math.PI);
    ctx.fill();
  };

  const draw1 = (ctx, frameCount) => {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    //Our draw came here
    const render = () => {
        clear(context);
      frameCount++;
      draw(context);
      draw1(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  });

  return <canvas ref={canvasRef} {...props} />;
};

export default Canvas;
