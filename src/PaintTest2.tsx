// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// https://github.com/elchininet/ColorTranslator

// https://elchininet.github.io/ColorTranslator/

import { Canvas } from 'Canvas';
import { foObject } from 'foundry/models/foObject.model';
import { foPage } from 'foundry/models/foPage.model';
import { hub } from './models/hub';

import React, { FunctionComponent, ReactElement } from 'react';
import { ColorArray, LEDLight, LightArray } from 'models/lights';
import { ToJSON } from 'core/foRenderer';
import { Tools } from 'foundry/models/foTools';
import { ColorTranslator } from 'colortranslator';

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

    const LEDArrayH = new LightArray({
        opacity: 0.1,
        x: page2.width / 2,
        y: page2.height / 2
    })
        .horizontal(LEDLight, { color: 'orange', opacity: 0.4 })
        .resetSize(20);

    const mult = 5;
    const blends = ColorTranslator.getBlendHEX('#FF00FF', '#FFFF00', mult + 10 * mult);

    const LEDArrayV = new LightArray({
        angle: 90,
        x: page2.width / 2,
        y: (page2.height * 2) / 3
    })
        .vertical(LEDLight, { color: 'red', opacity: 0.4 })
        .resetSize(13);

    const ColorArrayV = new ColorArray({
        colors: blends,
        x: page2.width / 2,
        y: page2.height / 3
    }).horizontal(LEDLight);

    const canvas2Params = {
        width: 1500,
        height: 800,
        title: 'Draw a string of lights',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            page2.render(ctx);
            shape2.render(ctx);
            LEDArrayH.render(ctx);
            LEDArrayV.render(ctx);
            ColorArrayV.render(ctx);
            ColorArrayV.colorRollDown();
        }
    };

    // const container = document.createElement('div');
    // const rows = 11;
    // const mult = 3;

    // for (let i = 0; i < rows; i++) {
    //     const blends = ColorTranslator.getBlendHEX('#FF0000', '#FFFF00', mult + i * mult);

    //     blends.forEach((blend, index) => {
    //         const box = document.createElement('div');
    //         box.classList.add('box', `file${i}`);
    //         box.style.background = blend;
    //         box.innerText = index + 1;
    //         container.appendChild(box);
    //     });
    // }

    // return container;

    return (
        <div>
            <Canvas {...canvas2Params} />
            <ToJSON {...Tools.asJson(ColorArrayV)} />
        </div>
    );
};
