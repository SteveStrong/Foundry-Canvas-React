// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import { Canvas } from 'Canvas';
import { foPage } from 'foundry/models/foPage.model';
import { foShape2D } from 'foundry/models/foShape2D.model';
import { foText2D } from 'foundry/models/foText2D.model';

import React, { FunctionComponent, ReactElement } from 'react';

import lang from './data/sampleaxl.json';
import rules from './data/sampleaxr.json';

export const App: FunctionComponent<any> = (props: any): ReactElement => {
    const page1 = new foPage({
        opacity: 0.02,
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
        x: page1.width / 2,
        y: page1.height / 2
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

    //page.setPinLeft();
    //page.angle = 200;

    const canvas1Params = {
        width: 1100,
        height: 1100,
        title: 'Testing Rendering of Bolt Holes',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            const pos = 120 * Math.sin(count * 0.05) ** 2;

            page1.render(ctx);

            shape.render(ctx);

            shape.subcomponents.forEach((item) => {
                item.angle += 1;
                item.pinX = (): number => {
                    return -220 + pos;
                };
                item.smash();
            });
        }
    };

    const page2 = new foPage({
        opacity: 0.02,
        color: 'yellow',
        width: 1000,
        height: 1000
    });

    const xxx = lang.SolutionXML.Document.Page;

    const canvas2Params = {
        width: 1100,
        height: 1100,
        title: 'Draw Json From Apprentice',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            page2.render(ctx);
        }
    };

    return (
        <div>
            <Canvas {...canvas2Params} />
            <Canvas {...canvas1Params} />
        </div>
    );
};

export default App;
