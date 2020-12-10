// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import { Canvas } from 'Canvas';
import { foObject } from 'foundry/models/foObject.model';
import { foPage } from 'foundry/models/foPage.model';
import { hub } from './models/hub';

import React, { FunctionComponent, ReactElement } from 'react';
import { LEDLight, LightArray } from 'models/lights';



export const PaintTest2: FunctionComponent<any> = (props: any): ReactElement => {

    const page2 = new foPage({
        opacity: 0.02,
        color: 'white',
        width: 1500,
        height: 500
    });


    const shape2 = new hub({
        x: page2.width / 2,
        y: page2.height / 2
    });


    const LEDArray = new LightArray({
        x: 0,
        y: page2.height / 2
    });

    LEDArray.components();

    const canvas2Params = {
        width: 1500,
        height: 800,
        title: 'Draw a string of lights',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            page2.render(ctx);
            shape2.render(ctx);
            LEDArray.render(ctx);
        }
    };

    return (
        <div>
            <Canvas {...canvas2Params} />
        </div>
    );
};


