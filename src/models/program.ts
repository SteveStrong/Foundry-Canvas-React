import { foObject } from "foundry/models/foObject.model";

export enum Operation {
    ON,
    OFF,
    RUN,
    STOP,
    SHOW,
    HIDE,
    EXECUTE
}

export class Instruction {
    op: Operation
    data: any

    constructor(op: Operation, data: any) {
        this.op = op;
        this.data = data;
    }
}

export interface IProgram {
    [step: number]: Instruction[];
}

export class Program {
    steps: IProgram = {};

    addStep(id: number, obj: Instruction): Program {
        if (!this.steps[id]) {
            this.steps[id] = [];
        }
        this.steps[id].push(obj);
        return this;
    }
}

export class ProgramManager extends foObject {
    program: Program = new Program();

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.override(properties);
    }

    addStep(id: number, obj: Instruction): Program {
        return this.program.addStep(id, obj);
    }

}