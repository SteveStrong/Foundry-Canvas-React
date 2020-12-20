// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// https://github.com/elchininet/ColorTranslator

// https://elchininet.github.io/ColorTranslator/

import { Canvas } from 'Canvas';

import React, { FunctionComponent, ReactElement } from 'react';
import { ColorArray, LEDLight, LightArray, LightDesignPage } from 'models/lights';
import { ToJSON } from 'core/foRenderer';
import { Tools } from 'foundry/models/foTools';
import { ColorTranslator } from 'colortranslator';
import { TimeLinePage, TimeStep } from 'models/timeline';
import { Effect } from 'models/effect';
import { WaveDesignPage, WaveShape } from 'models/wave';
import { WalkerDesignPage } from 'models/walker';
import { SharedTimer } from 'models/globalClock';
import { ClockFace } from 'ClockFace';

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

export const PaintTest6: FunctionComponent<any> = (): ReactElement => {
    const sourceLED = new LEDLight();
    const sourceStep = new TimeStep();

    const wavePage = new WaveDesignPage({
        opacity: 0.02,
        color: 'white',
        width: 800,
        height: 400
    });

    const wave = new WaveShape({
        x: wavePage.width / 2,
        y: wavePage.height / 2,
        width: 800,
        height: 400
    });
    wavePage.addWave(wave);

    const walkerPage = new WalkerDesignPage({
        opacity: 0.02,
        color: 'white',
        width: 1600,
        height: 200
    });

    const groupSteps = 160;
    const TimeLineGroupStamp = (groupId: number, rows: number = 2, props?: any) => {
        return new TimeLinePage({
            color: 'white',
            groupId: groupId,
            width: groupSteps * sourceStep.width,
            height: rows * sourceStep.height,
            gridSizeX: sourceStep.width,
            gridSizeY: sourceStep.height,
            ...props
        });

    };

    const Group1 = TimeLineGroupStamp(1);
    const Group2 = TimeLineGroupStamp(2);
    const Group3 = TimeLineGroupStamp(3);
    const Group4 = TimeLineGroupStamp(4);
    SharedTimer.addTimeLinePage(Group1)
        .addTimeLinePage(Group2)
        .addTimeLinePage(Group3)
        .addTimeLinePage(Group4);

    const EffectStamp = (size: number = 20, props?: any) => {
        return new Effect({
            total: size,
            x: 0,
            y: 0
        }).horizontal(TimeStep, props);
    };

    const Effect1 = EffectStamp(6, { color: 'orange' }).setTimeOffset(10);
    const Effect2 = EffectStamp(40, { color: 'green' }).followEffect(Effect1);
    const Effect3 = EffectStamp(40, { color: 'yellow' }).followEffect(Effect2);
    const Effect4 = EffectStamp(40, { color: 'red' }).followEffect(Effect3);

    const Effect5 = EffectStamp(55, { color: 'blue' });
    const target = 50;
    //Effect5.setX(size * target).setTimeOffset(target, SharedTimer.computeTimeOffset(target));;
    Effect5.setTimeOffset(target);

    Group1.addEffect(Effect1);
    // Group1.addEffect(Effect2);
    // Group2.addEffect(Effect3);
    // Group3.addEffect(Effect4);
    // Group4.addEffect(Effect5);

    const lightPage = new LightDesignPage({
        opacity: 1.0,
        color: 'white',
        width: 35 * sourceLED.width,
        height: 8 * sourceLED.height,
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



    const LEDString1 = LEDStringStamp(25, 1);
    const LEDString2 = LEDStringStamp(25, 2);
    const LEDString3 = LEDStringStamp(25, 3);
    const LEDString4 = LEDStringStamp(25, 4);
    const LEDString5 = LEDStringStamp(25, 5);
    const LEDString6 = LEDStringStamp(25, 6);

    lightPage.addLightArray(LEDString1);
    lightPage.addLightArray(LEDString2);
    lightPage.addLightArray(LEDString3);
    lightPage.addLightArray(LEDString4);
    lightPage.addLightArray(LEDString5);
    lightPage.addLightArray(LEDString6);

    const lightCanvasParams = {
        width: lightPage.width,
        height: lightPage.height,
        title: 'Light Canvas',
        draw: (ctx: CanvasRenderingContext2D) => {
            lightPage.isDirty && lightPage.render(ctx);
        }
    };

    const waveCanvasParams = {
        width: wavePage.width,
        height: wavePage.height,
        title: 'Wave Designer Canvas',
        draw: (ctx: CanvasRenderingContext2D) => {
            wavePage.render(ctx);
        }
    };

    const walkerCanvasParams = {
        width: walkerPage.width,
        height: walkerPage.height,
        title: 'Waker Designer Canvas',
        draw: (ctx: CanvasRenderingContext2D) => {
            walkerPage.render(ctx);
        }
    };


    //SharedTimer.override({ endTimeCode: groupSteps });
    SharedTimer.start();

    return (
        <div>
            <Canvas {...walkerCanvasParams} />
            <Canvas {...lightCanvasParams} />
            <ClockFace  />
            <Canvas {...Group1.canvasParams()} />
            <Canvas {...Group2.canvasParams()} />
            <Canvas {...Group3.canvasParams()} />
            <Canvas {...Group4.canvasParams()} />
            <Canvas {...waveCanvasParams} />
        </div>
    );
};
