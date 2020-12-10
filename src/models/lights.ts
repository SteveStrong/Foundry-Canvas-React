import { foShape2D } from "foundry/models/foShape2D.model";


export class LEDLight extends foShape2D {
    color: string = 'blue';
    opacity: number = 3.0;
    _width: number = 50;
    _height: number = 50;
}
