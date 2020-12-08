// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import { Canvas } from 'Canvas';
import { foPage } from 'foundry/models/foPage.model';
import { foShape2D } from 'foundry/models/foShape2D.model';
import { foText2D } from 'foundry/models/foText2D.model';

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

    const page = new foPage({
        opacity: .02,
        color: 'orange',
        width: 1000,
        height: 1000
    });

    const shape1 = new foShape2D({ opacity: 0.3, height: 200, width: 10 });
    shape1.setPinRight().setPinBottom();

    const shape = new foShape2D({
        color: 'blue',
        opacity: 3.0,
        width: 5,
        height: 5,
        x: page.width / 2,
        y: page.height / 2
    });

    const list = '0,1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26'.split(',');
    const angle = 360 / list.length;
    let i = 0;
    list.forEach((item) => {
        const text = new foText2D({
            text: item,
            fontSize: 30,
            angle: angle * i,
            background: 'tan',
            color: 'black',
            width: 50,
            height: 40
        });
        text.pinX = (): number => -220;
        i++;
        shape.subcomponents.addMember(text);

        //text.subcomponents.addMember(shape1);
    });

    const canvasParams = {
        width: 1100,
        height: 1100,
        title: 'Render A model to the canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            const pos = 120 * Math.sin(count * 0.05) ** 2;

            page.render(ctx);
            shape.render(ctx);

            shape.subcomponents.forEach(item => {
                item.angle += 1;
                item.pinX = (): number => { return -220 + pos; }
                item.smash();
            });
            //shape.x = pos;
            //shape.angle = pos;
            //draw1(ctx, count);
            //megadraw(ctx, count);
        }
    };

    return (
        <div>
            <Canvas {...canvasParams} />
        </div>
    );
};

export default App;
