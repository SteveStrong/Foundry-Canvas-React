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
import { TimeStep } from 'models/timeline';

export const PaintTest3: FunctionComponent<any> = (props: any): ReactElement => {
    const sourceLED = new LEDLight();
    const sourceStep = new TimeStep();

    const timelinePage = new foPage({
        opacity: 0.02,
        color: 'white',
        width: 160 * sourceStep.width,
        height: 5 * sourceStep.height,
        gridSizeX: sourceStep.width,
        gridSizeY: sourceStep.height
    });

    const lightPage = new foPage({
        opacity: 0.02,
        color: 'white',
        width: 71 * sourceLED.width,
        height: 10 * sourceLED.height,
        gridSizeX: sourceLED.width,
        gridSizeY: sourceLED.height
    });

    const mult = 5;
    const blends = ColorTranslator.getBlendHEX('#FF00FF', '#FFFF00', mult + 10 * mult);

    const ColorArrayStamp = (row: number = 1) => {
        return new ColorArray({
            colors: blends,
            x: lightPage.width / 2,
            y: sourceLED.height * row
        }).horizontal(LEDLight);
    };

    const timelineCanvasParams = {
        width: timelinePage.width,
        height: timelinePage.height,
        title: 'Timeline Canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            timelinePage.render(ctx);
        }
    };

    const ColorArrayV1 = ColorArrayStamp(1);
    const ColorArrayV2 = ColorArrayStamp(2);
    const lightCanvasParams = {
        width: lightPage.width,
        height: lightPage.height,
        title: 'Light Canvas',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            lightPage.render(ctx);

            ColorArrayV1.render(ctx);
            ColorArrayV1.colorRollDown();
            ColorArrayV2.render(ctx);
            ColorArrayV2.colorRollUp();
        }
    };

    return (
        <div>
            <Canvas {...timelineCanvasParams} />
            <Canvas {...lightCanvasParams} />
            <ToJSON {...Tools.asJson(ColorArrayV1)} />
        </div>
    );
};
