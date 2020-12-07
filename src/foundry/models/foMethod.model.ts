import { foKnowledge } from './foKnowledge.model';
import { foNode } from './foNode.model';
import { Action, Spec } from './foInterface';

export class foMethod<T extends foNode> extends foKnowledge {
  funct: Action<T>;

  constructor(funct: Action<T>, spec?: any) {
    super(spec);
    this.funct = funct;
  }

  run(context?: any) {
    return this.funct(context);
  }
}

export class foFactory<T extends foNode> extends foKnowledge {
  funct: Spec<T>;

  constructor(funct: Spec<T>, spec?: any) {
    super(spec);
    this.funct = funct;
  }

  run(context?: any) {
    return this.funct(context);
  }

  newInstance(properties?: any, subcomponents?: any, parent?: any): any {
    const result = this.run(properties);
    const list = Array.isArray(result) ? result : [result];
    parent && list.forEach( item => item.addAsSubcomponent(parent));
    return list[0];
  }

  makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {
    const result = this.run(properties);
    const list = Array.isArray(result) ? result : [result];
    parent && list.forEach( item => item.addAsSubcomponent(parent));
    return list[0];
  }
}
