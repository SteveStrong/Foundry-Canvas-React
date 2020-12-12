import { useCanvas2D } from 'CanvasHook';
import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import { ToJSON } from './core/foRenderer'


export const Canvas: FunctionComponent<any> = (props: any): ReactElement => {
    const { draw, ...rest } = props;
    const canvasRef = useCanvas2D(draw);

    return (
        <Fragment>
            <h1>{props.title}</h1>
            <canvas ref={canvasRef} {...rest} />
            {/* <ToJSON {...props} /> */}
        </Fragment>
    );
};

