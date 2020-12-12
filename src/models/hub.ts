import { foShape2D } from "foundry/models/foShape2D.model";


export class hub extends foShape2D {
    color: string = 'blue';
    opacity: number = 3.0;
    _width: number = 5;
    _height: number = 5;

    moveComponents(offset: number = 0, ang: number = 0) {
        this.subcomponents.forEach((item: any) => {
            item.angle += ang;
            item.edgeOffset += offset;
        });
    }
}
