import { foObject } from "foundry/models/foObject.model";
import { Tools } from "foundry/models/foTools";

export enum Operation {
    ON = 'ON',
    OFF = 'OFF',
    RUN = 'RUN',
    STOP = 'STOP',
    SHOW = 'SHOW',
    HIDE = 'HIDE',
    EXECUTE = 'EXE'
}

export interface ISettings {
    Id: number;
    groupId: number;
    name?: string;
    color?: string;
}

export class Instruction {
    op: Operation
    data: ISettings

    constructor(op: Operation, data: ISettings) {
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

    getStep(id: number): Instruction[] {
        return this.steps[id];
    }

    programAsInstructionList(): Instruction[] {
        const list:any = []
        Tools.forEachKeyValue(this.steps, (key:number, value: Instruction[]) => {
            value.forEach(item => {
                item['seq'] = item.data.Id;
                list.push(item);
            });
        })
        return list;
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
    getStep(id: number): Instruction[] {
        return this.program.getStep(id);
    }

    programAsInstructionList(): Instruction[] {
        return this.program.programAsInstructionList();
    }
}