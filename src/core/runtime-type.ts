
import { FunctionComponent } from "react";

export const API_LIST_SEPARATOR = ',';
export const API_REFERENCE_KEY = '!REF:';

export type Constructable<T> = new (...args: any) => T;
export type ConstructableClass<T> = new (...args: any[]) => {};
export type FuncAny = (...args: any) => any;
export type FuncT<T> = (arg: T) => any;


// export function hasKey<O>(obj: O, key: string | number | symbol): key is keyof O {
//     return key in obj;
// }




class foRuntimeTypes {


    private _defaultRenderComponent: { [id: string]: FunctionComponent<any> } = {};

    private _defaultRoute: { [id: string]: string } = {};

    private _defaultConstructor: { [id: string]: Constructable<any> } = {};

    setDefaultRenderComponent(prefix:string, render: FunctionComponent<any> ): void{
        this._defaultRenderComponent[prefix] = render
    }

    getDefaultRenderComponent(prefix:string ):FunctionComponent<any> | null {
        return this._defaultRenderComponent[prefix];
    }

    isRegisteredPrefix(prefix: string): boolean {
        return this._defaultRenderComponent[prefix] ? true : false;
    }

    registeredDefaultRoute(prefix: string, path: string): string {
        this._defaultRoute[prefix] = path;
        return `/${path}`;
    }

    computeDefaultRoute(prefix: string, documentName: string, defaultPath:string): string {
        const path = this._defaultRoute[prefix];
        const route =  path ? `/${path}/${documentName}` : defaultPath;
        // console.log (`compute path: ${route}`);
        return route;
    }

    registerModelConstructor(prefix: string, model: Constructable<any>) {
        this._defaultConstructor[prefix] = model;
    }

    defaultConstructor(prefix: string): Constructable<any>{
        return this._defaultConstructor[prefix];
    }
}


export let RuntimeTypes: foRuntimeTypes = new foRuntimeTypes();