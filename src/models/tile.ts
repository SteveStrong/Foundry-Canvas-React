import { foObject } from "foundry/models/foObject.model";
import { foText2D } from "foundry/models/foText2D.model";


export class tile extends foText2D {
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