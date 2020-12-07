import { useCanvas2D } from 'CanvasHook';
import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import { ToJSON } from './core/foRenderer'


export const Canvas: FunctionComponent<any> = (props: any): ReactElement => {
    const { draw, ...rest } = props;
    const canvasRef = useCanvas2D(draw);

    return (
        <Fragment>
            <h1>Hello world!</h1>
            <ToJSON {...props} />
            <canvas ref={canvasRef} {...rest} />
        </Fragment>
    );
};

