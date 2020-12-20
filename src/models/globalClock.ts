import { foCollection } from "foundry/models/foCollection.model";
import { foObject } from "foundry/models/foObject.model";
import { foPage } from "foundry/models/foPage.model";
import { foShape2D, IfoShape2DProperties } from "foundry/models/foShape2D.model";
import { Tools } from "foundry/models/foTools";
import { Effect } from "./effect";
import { rxPubSub } from "./rxPubSub";
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

    setSpec(spec: ITimeSpec):GlobalClock {
        this.timeTrack.setSpec(spec);
        return this;
    }


    protected _subcomponents: foCollection<TimeLinePage>;
    get subcomponents(): foCollection<TimeLinePage> {
        if (!this._subcomponents) {
            this._subcomponents = new foCollection<TimeLinePage>()
        }
        return this._subcomponents;
    }

    addTimeLinePage(item: TimeLinePage): GlobalClock {
        item.timeTrack.setSpec(this.timeTrack);
        this.subcomponents.addMember(item);
        item.markAsDirty();
        return this;
    }

    notifyComponents(globalStep: number, globalTime: number) {
        this.timeTrack.setTimecode(globalStep, globalTime);

        this.subcomponents.forEach(item => {
            item.setTimecode(globalStep, globalTime);
            item.markAsDirty();
        });
    }

    markAsClean() {
        this.subcomponents.forEach(item => {
            item.markAsClean();
        });
    }

    start() {
        this._timer = setTimeout(() => {
            if (!!(this._timer && !(this._timer % 2))) {
                this.timeCode++;
 
                this.notifyComponents(this.timeCode, this.timeTrack.timeScale * this.timeCode);

                if (this.timeCode === this.timeTrack.totalSteps) {
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



