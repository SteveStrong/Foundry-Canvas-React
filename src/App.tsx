// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import React from 'react'

import Canvas from './Canvas'

function App() {

    const draw = (ctx:CanvasRenderingContext2D, frameCount:number) => {
      ctx.fillStyle = '#0000FF';
      ctx.beginPath();
      const pos = 600 * Math.sin(frameCount * 0.05) ** 2;
      ctx.arc(15 + pos, 50, 20, 0, 2 * Math.PI);
      ctx.fill();
    };

  const draw1 = (ctx: CanvasRenderingContext2D, frameCount: number) => {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
      ctx.fill();
    };
  
    const props = {
      width: 800,
      height: 500,
      draw: (ctx: CanvasRenderingContext2D, count: number) => {
        draw1(ctx, count);
        draw(ctx, count);
        return;
      }
    };
  
  return (
    <div>
      <h1>Hello world!</h1>
      <Canvas {...props}/>
    </div>
  );
}


export default App;
