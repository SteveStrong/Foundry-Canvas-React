// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import { Canvas } from 'Canvas';

import React, { FunctionComponent, ReactElement } from 'react';

export const App: FunctionComponent<any> = (props: any): ReactElement => {
    const draw = (ctx: CanvasRenderingContext2D, frameCount: number, loc = 0) => {
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        const pos = 600 * Math.sin(frameCount * 0.05) ** 2;
        ctx.arc(15 + pos, loc + 50 + 0.2 * pos, 1 + 0.05 * pos, 0, 2 * Math.PI);
        ctx.fill();
    };

    const draw1 = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(100, 100, 10 + 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
        ctx.fill();
    };

    const megadraw = (ctx: CanvasRenderingContext2D, count: number) => {
        draw(ctx, count, 20);
        draw(ctx, count, 45);
        draw(ctx, count, 70);
    };

    // const shape = new foText2D({
    //     text: 'Hello World'
    // });

    const canvasParams = {
        width: 800,
        height: 500,
        title: 'Render A model to the canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            draw1(ctx, count);
            megadraw(ctx, count);
            //shape.render(ctx);
            return;
        }
    };

    return (
        <div>
            <Canvas {...canvasParams} />
        </div>
    );
};

export default App;
