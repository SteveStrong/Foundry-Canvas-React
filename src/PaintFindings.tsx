// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// https://github.com/elchininet/ColorTranslator

// https://elchininet.github.io/ColorTranslator/

//https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes

import { Canvas } from 'Canvas';

import React, { FunctionComponent, ReactElement } from 'react';
import { Tools } from 'foundry/models/foTools';
import { ToJSON } from 'core/foRenderer';

import findingData from './data/enriched_report.json';
import { LEDLight, LightArray, LightDesignPage } from 'models/lights';
import { TimeStep } from 'models/timeline';
import { foText2D } from 'foundry/models/foText2D.model';

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

const solution = () => {
    const list: Array<any> = new Array<any>();

    Tools.forEachKeyValue(findingData, (id, obj) => {
        list.push(obj);
    });

    const sourceLED = new LEDLight();
    const sourceStep = new TimeStep();

    const lightPage = new LightDesignPage({
        opacity: 1.0,
        color: 'white',
        width: 35 * sourceLED.width,
        height: 307 * sourceLED.height,
        gridSizeX: sourceLED.width,
        gridSizeY: sourceLED.height
    });

    const LEDStringStamp = (size: number = 20, row: number = 1, props?: any) => {
        return new LightArray({
            groupId: row,
            total: size,
            x: lightPage.width / 2,
            y: sourceStep.height * row
        }).horizontal(LEDLight, props);
    };

    const LEDString5 = LEDStringStamp(25, 5);
    const LEDString6 = LEDStringStamp(25, 9);

    lightPage.addLightArray(LEDString5);
    lightPage.addLightArray(LEDString6);


    const label = new foText2D({

    });

    const lightCanvasParams = {
        width: lightPage.width,
        height: lightPage.height,
        title: 'Light Canvas',
        draw: (ctx: CanvasRenderingContext2D) => {
            lightPage.isDirty && lightPage.render(ctx);
        }
    };

    return { lightCanvasParams, list };
};

const data = solution();

export const PaintFindings: FunctionComponent<any> = (): ReactElement => {
    const { lightCanvasParams, list } = data;

    return (
        <div>
            <Canvas {...lightCanvasParams} />
            <ToJSON {...data} />
        </div>
    );
};
