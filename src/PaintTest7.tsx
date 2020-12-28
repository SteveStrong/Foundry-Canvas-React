// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// https://github.com/elchininet/ColorTranslator

// https://elchininet.github.io/ColorTranslator/

//https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes

import { Canvas } from 'Canvas';

import React, { FunctionComponent, ReactElement } from 'react';
import { LEDLight, LightArray, LightDesignPage } from 'models/lights';
import { TimeLinePage, TimeStep } from 'models/timeline';
import { Effect } from 'models/effect';
import { SharedTimer } from 'models/globalClock';
import { ClockFace } from 'ClockFace';
import { ToJSON } from 'core/foRenderer';

// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

const solution = () => {
    const sourceLED = new LEDLight();
    const sourceStep = new TimeStep();

    SharedTimer.setSpec({
        timeScale: 10,
        startStep: 0,
        totalSteps: 150
    }).timeTrigger = 100;

    const groupSteps = SharedTimer.timeTrack.totalSteps;
    const TimeLineGroupStamp = (groupId: number, rows: number = 2, props?: any) => {
        return new TimeLinePage({
            color: 'white',
            stepWidth: sourceStep.width,
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
    const Group5 = TimeLineGroupStamp(5);
    const Group6 = TimeLineGroupStamp(6);

    //you need this is react will rerender.
    //but inside this function we only run it once
    //SharedTimer.clearSubcomponents();
    SharedTimer.addTimeLinePage(Group1).addTimeLinePage(Group2).addTimeLinePage(Group3).addTimeLinePage(Group4).addTimeLinePage(Group5).addTimeLinePage(Group6);

    const EffectStamp = (name: string, size: number = 20, props?: any) => {
        return new Effect({
            myName: name,
            total: size,
            x: 0,
            y: 0
        }).horizontal(TimeStep, props);
    };

    const Effect0 = EffectStamp('E0', 10, { color: '#FF5733' });

    const Effect1 = EffectStamp('E1', 30, { color: '#54C82B' }).setStepOffset(10);
    const Effect2 = EffectStamp('E2', 45, { color: '#2B7CC8' }).followEffect(Effect1);
    const Effect3 = EffectStamp('E3', 50, { color: '#7FEE10' }).followEffect(Effect1);
    const Effect4 = EffectStamp('E4', 52, { color: '#10CFEE' }).followEffect(Effect1);

    const Effect5 = EffectStamp('E5', 55, { color: '#B72BC8' });
    const target = 50;
    Effect5.setStepOffset(target);

    Group1.addEffect(Effect0);
    Group1.addEffect(Effect1);
    Group1.addEffect(Effect2);
    Group2.addEffect(Effect3);
    Group3.addEffect(Effect4);
    Group4.addEffect(Effect5);

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

    const LEDString1 = LEDStringStamp(25, 1); //.setSource(Group1);
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

    SharedTimer.addLightDesignPage(lightPage);
    const program = SharedTimer.compileTimeline();
    lightPage.setProgram(program);
    return { lightCanvasParams, Group1, Group2, Group3, Group4, program };
};

const data = solution();

export const PaintTest7: FunctionComponent<any> = (): ReactElement => {
    const { lightCanvasParams, Group1, Group2, Group3, Group4, program } = data;
    SharedTimer.start();

    return (
        <div>
            <Canvas {...lightCanvasParams} />
            <ClockFace />
            <Canvas {...Group1.canvasParams()} />
            <Canvas {...Group2.canvasParams()} />
            <Canvas {...Group3.canvasParams()} />
            <Canvas {...Group4.canvasParams()} />
            <ToJSON {...program} />
        </div>
    );
};
