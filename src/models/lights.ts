import { foShape2D } from "foundry/models/foShape2D.model";


export class LEDLight extends foShape2D {
    color: string = 'blue';
    opacity: number = 3.0;
    _width: number = 50;
    _height: number = 50;
}


export class LightArray extends foShape2D {
    total: number = 30;
    components() {
        if (this.subcomponents.length === 0) {    
            for (let i = 0; i < this.total; i++) {
                const led = new LEDLight({
                    index: i,
                    x: i * 50,
                    y: i
                });
                this.subcomponents.addMember(led);
            }   
        }
        return this.subcomponents
    }
}