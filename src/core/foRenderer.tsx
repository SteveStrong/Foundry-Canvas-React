import React, { FunctionComponent, ReactElement, createElement, useMemo } from 'react';
import { Constructable } from './runtime-type';

export const ToJSON: FunctionComponent<any> = (props: any): ReactElement => {
    return <pre>{JSON.stringify(props, undefined, 3)} </pre>;
};


export const EmptyRender: FunctionComponent = (): ReactElement => {
    return <div>Empty component displayed if no component is available in FoRender class</div>;
};


export interface IfoRenderViewModel{}

export class foRender<T extends IfoRenderViewModel> {
    props: T = {} as T;
    Component: React.FunctionComponent<T> = EmptyRender;
    
    display(props?: T) {
        if (props) {
            this.props = { ...this.props, ...props};
        }
        return createElement(this.Component, this.props);
    }
    
}

export interface IfoComponentViewModel{ }

export class foComponent<T extends IfoComponentViewModel> {
    props: T = {} as T;
    Component: React.FunctionComponent<T> = EmptyRender;

    display(props?: T) {
        if (props) {
             this.props = { ...this.props, ...props};
        }
        return createElement(this.Component, this.props);
    }
}

export const useComponentClass = <S, T extends foComponent<S>>(Implementation: Constructable<T>, props: S): ReactElement => {
    return useMemo(() => new Implementation(), [Implementation]).display(props);
};

export const useRenderClass = <T extends foRender<any>>(Implementation: Constructable<T>): foRender<any> => {
    return useMemo(() => {
        return new Implementation();
    }, [Implementation]);
};

