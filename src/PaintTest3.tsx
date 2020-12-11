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

export const PaintTest3: FunctionComponent<any> = (props: any): ReactElement => {
    const source = new LEDLight();

    const timelinePage = new foPage({
        opacity: 0.02,
        color: 'white',
        width: 61 * source.width,
        height: 10 * source.height
    });

    const lightPage = new foPage({
        opacity: 0.02,
        color: 'white',
        width: 61 * source.width,
        height: 10 * source.height,
        gridSizeX: source.width,
        gridSizeY: source.height
    });

    const shape2 = new hub({
        x: timelinePage.width / 2,
        y: timelinePage.height / 2
    });

    const LEDArrayH = new LightArray({
        opacity: 0.1,
        x: timelinePage.width / 2,
        y: timelinePage.height / 2
    })
        .horizontal(LEDLight, { color: 'orange', opacity: 0.4 })
        .resetSize(20);

    const mult = 5;
    const blends = ColorTranslator.getBlendHEX('#FF00FF', '#FFFF00', mult + 10 * mult);

    const LEDArrayV = new LightArray({
        angle: 90,
        x: timelinePage.width / 2,
        y: (timelinePage.height * 2) / 3
    })
        .vertical(LEDLight, { color: 'red', opacity: 0.4 })
        .resetSize(13);

    const ColorArrayV = new ColorArray({
        colors: blends,
        x: timelinePage.width / 2,
        y: timelinePage.height / 3
    }).horizontal(LEDLight);

    const timelineCanvasParams = {
        width: timelinePage.width,
        height: timelinePage.height,
        title: 'Timeline Canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            timelinePage.render(ctx);
        }
    };

    const lightCanvasParams = {
        width: lightPage.width,
        height: lightPage.height,
        title: 'Light Canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            timelinePage.render(ctx);
            shape2.render(ctx);
            LEDArrayH.render(ctx);
            LEDArrayV.render(ctx);
            ColorArrayV.render(ctx);
            ColorArrayV.colorRoll();
        }
    };

    return (
        <div>
            <Canvas {...timelineCanvasParams} />
            <Canvas {...lightCanvasParams} />
            <ToJSON {...Tools.asJson(ColorArrayV)} />
        </div>
    );
};
