// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

import { Canvas } from 'Canvas';
import { foObject } from 'foundry/models/foObject.model';
import { foPage } from 'foundry/models/foPage.model';
import { foShape2D } from 'foundry/models/foShape2D.model';
import { foText2D } from 'foundry/models/foText2D.model';

import React, { FunctionComponent, ReactElement } from 'react';

import lang from './data/sampleaxl.json';
import rules from './data/sampleaxr.json';

class tile extends foText2D {
    edgeOffset: number;
    fontSize: number = 20;
    color: string = 'black';
    protected _background: string = 'green';
    protected _width: number = 120;
    protected _height: number = 50;

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    public pinX = (): number => {
        return -240 + this.edgeOffset;
    };
}

class hub extends foShape2D {
    color: string = 'blue';
    opacity: number = 3.0;
    _width: number = 5;
    _height: number = 5;

    moveComponents(offset:number=0, ang:number=0) {
        this.subcomponents.forEach((item: any) => {
            item.angle += ang;
            item.edgeOffset += offset;
        });
    }
}

export const PaintTest2: FunctionComponent<any> = (props: any): ReactElement => {
    const page1 = new foPage({
        opacity: 0.02,
        color: 'orange',
        width: 1000,
        height: 1000
    });

    const page2 = new foPage({
        opacity: 0.02,
        color: 'yellow',
        width: 1000,
        height: 1000
    });

    const shape = new foShape2D({ opacity: 0.3, height: 200, width: 10 });
    shape.setPinRight().setPinBottom();

    const shape1 = new foShape2D({
        color: 'blue',
        opacity: 3.0,
        width: 5,
        height: 5,
        x: page1.width / 2,
        y: page1.height / 2
    });

    const shape2 = new hub({
        x: page2.width / 2,
        y: page2.height / 2
    });

    const list1 = '0,1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26'.split(',');
    const angle = 360 / list1.length;

    list1.forEach((item, index) => {
        const text = new foText2D({
            text: item,
            fontSize: 30,
            angle: angle * index,
            background: 'tan',
            color: 'black',
            width: 50,
            height: 40
        });
        text.pinX = (): number => -220;
        shape1.subcomponents.addMember(text);

        text.subcomponents.addMember(shape);
    });

    list1.forEach((item, index) => {
        const label = `${item}:${index}`;

        function oddOrEven(x) {
            return x & 1 ? 'red' : 'blue';
        }
        const child = new tile({
            text: item,
            background: oddOrEven(index),
            angle: angle * index,
            edgeOffset: 50 + (index & 1) * 20
        });

        shape2.subcomponents.addMember(child);
    });


    const canvas1Params = {
        width: 1100,
        height: 1100,
        title: 'Testing Rendering of Bolt Holes',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            const pos = 120 * Math.sin(count * 0.05) ** 2;

            page1.render(ctx);

            shape1.render(ctx);

            shape1.subcomponents.forEach((item) => {
                item.angle += 1;
                item.pinX = (): number => {
                    return -220 + pos;
                }; 
            });
        }
    };

    const rawdata = lang.SolutionXML.Document.Page;

    const canvas2Params = {
        width: 1100,
        height: 1100,
        title: 'Draw Json From Apprentice',
        draw: (ctx: CanvasRenderingContext2D, count: number) => {
            const pos = 10 * Math.sin(count * 0.05);
            page2.render(ctx);
            shape2.render(ctx);

            shape2.moveComponents(pos,2);
        }
    };

    return (
        <div>
            <Canvas {...canvas2Params} />
            <Canvas {...canvas1Params} />
        </div>
    );
};


