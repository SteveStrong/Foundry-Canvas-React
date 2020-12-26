import { foCollection } from "foundry/models/foCollection.model";
import { foObject } from "foundry/models/foObject.model";
import { LightDesignPage } from "./lights";
import { Instruction, Operation, ProgramManager } from "./program";
import { TimeTracker, TimeLinePage, ITimeSpec } from "./timeline";




export class GlobalClock extends foObject {
    _timer: any = undefined;

    timeTrack: TimeTracker = new TimeTracker();
    timeCode: number = 0;

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);

        this.setSpec({
            timeScale: 10,
            startStep: 0,
            totalSteps: 100
        })

        this.override(properties);
    }

    _timeTrigger: number = 500;
    get timeTrigger(): number {
        return this._timeTrigger;
    }
    set timeTrigger(value: number) {
        this._timeTrigger = value;
        if (this._timer) {
            this.stop().start();
        }
    }

    setSpec(spec: ITimeSpec): GlobalClock {
        this.timeTrack.setSpec(spec);
        return this;
    }


    protected _timelines: foCollection<TimeLinePage>;
    get timelines(): foCollection<TimeLinePage> {
        if (!this._timelines) {
            this._timelines = new foCollection<TimeLinePage>()
        }
        return this._timelines;
    }

    clearTimelines(): GlobalClock {
        if (this._timelines) {
            this._timelines.clearAll();
        }
        return this;
    }

    addTimeLinePage(item: TimeLinePage): GlobalClock {
        if ( !this.timelines.isMember(item) && item.myGuid) {
            item.timeTrack.setSpec(this.timeTrack);
            this.timelines.addMember(item);
            item.markAsDirty();
        }
        return this;
    }

    protected _lightgroups: foCollection<LightDesignPage>;
    get lightgroups(): foCollection<LightDesignPage> {
        if (!this._lightgroups) {
            this._lightgroups = new foCollection<LightDesignPage>()
        }
        return this._lightgroups;
    }

    clearLightgroups(): GlobalClock {
        if (this._lightgroups) {
            this._lightgroups.clearAll();
        }
        return this;
    }

    addLightDesignPage(item: LightDesignPage): GlobalClock {
        if (!this.lightgroups.isMember(item) && item.myGuid) {
            this.lightgroups.addMember(item);
            item.markAsDirty();
        }
        return this;
    }

    initProgramManager(): ProgramManager {
        const manager = new ProgramManager();

        this.timelines.forEach(item => {
            manager.addStep(0, new Instruction(
                Operation.OFF,
                { Id: 0, groupId: item.groupId }
            ));
        });
        return manager;
    }

    compileTimeline(): ProgramManager {
        const manager = this.initProgramManager();

        for (let step = 0; step < this.timeTrack.totalSteps; step++) {
            this.timelines.forEach(item => {
                item.compileTimeline(manager, step);
            })
        }

        return manager;
    }

    notifyComponents(globalStep: number, globalTime: number) {
        this.timeTrack.setTimecode(globalStep, globalTime);

        this.lightgroups.forEach(item => {
            item.setTimecode(globalStep, globalTime).markAsDirty();
        });

        this.timelines.forEach(item => {
            item.setTimecode(globalStep, globalTime).markAsDirty();
        });
    }

    markAsClean() {
        this.timelines.forEach(item => {
            item.markAsClean();
        });
    }

    start() {
        this._timer = setTimeout(() => {
            if (!!(this._timer && !(this._timer % 2))) {
                
                this.notifyComponents(this.timeCode, this.timeTrack.timeScale * this.timeCode);
                
                this.timeCode++;
                if (this.timeCode > this.timeTrack.totalSteps) {
                    this.timeCode = 0;
                }
            }
            this.start();
        }, this._timeTrigger);

        return this;
    }

    stop(): GlobalClock {
        this._timer && clearTimeout(this._timer);
        this._timer = undefined;
        this.markAsClean();
        return this;
    }
}

export let SharedTimer: GlobalClock = new GlobalClock();



