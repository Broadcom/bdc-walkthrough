import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class BdcWalkService {
  private _notify = new BehaviorSubject<void>(null);
  private _notifyDisplaying = new Subject<BdcDisplayEvent>();
  private _values: TaskList;
  private _displaying: {[id: string]: boolean} = {};
  private _version = 1;
  private _key = 'bdcWalkthrough';
  private _disabled = false;

  changes = this._notify.asObservable();
  changesDisplaying = this._notifyDisplaying.asObservable();

  get disabled() {
    return this._disabled;
  }

  constructor() {
    this._values = JSON.parse(localStorage.getItem(this._key)) || {};

    // reset all values if version is different
    if (this._values.version !== this._version) {
      this.reset();
    }
  }

  migrate(migrations: BdcWalkMigration[]) {
    const version = this._values.migrationVersion || 0;

    migrations.filter(migration => migration.version > version).forEach(migration => {
      console.log(`Running bdc-migration version ${migration.version}`);

      migration.operations.forEach(operation => {
        if (this.evalMustCompleted(operation.condition)) {
          Object.entries(operation.then).forEach(([id, data]) => {
            if (data) {
              this._values[id] = data;
            } else {
              delete this._values[id];
            }
          });
        }
      });

      this._values.migrationVersion = migration.version;
    });

    this.save();
  }

  getIsDisplaying(id: string): boolean {
    return this._displaying[id] || false;
  }

  setIsDisplaying(id: string, visible: boolean) {
    if (this._displaying[id] !== visible) {
      if (visible) {
        this._displaying[id] = visible;
      } else {
        delete this._displaying[id];
      }

      this._notify.next();
      this._notifyDisplaying.next({id, visible, action: BdcDisplayEventAction.VisibilityChanged});
    }
  }

  logUserAction(id: string, action: BdcDisplayEventAction) {
    this._notifyDisplaying.next({id, visible: false, action});
  }

  getTaskCompleted(id: string): any | boolean {
    return this._values[id] || false;
  }

  setTaskCompleted(id: string, value: any | boolean = true) {
    if (this._values[id] !== value && value) {
      this._values[id] = value;
      this.save();
    } else if (this._values.hasOwnProperty(id) && !value) {
      delete this._values[id];
      this.save();
    }
  }

  setTasks(tasks: TaskList) {
    let changed = false;

    Object.entries(tasks).forEach(([id, data]) => {
      if (this._values[id] !== data && data) {
        this._values[id] = data;
        changed = true;
      } else if (this._values.hasOwnProperty(id) && !data) {
        delete this._values[id];
        changed = true;
      }
    });

    if (changed) {
      this.save();
    }
  }

  getTasks() {
    return {...this._values};
  }

  reset(prefix?: string) {
    if (prefix) {
      // remove only keys prefixed with param
      Object.keys(this._values).filter(key => key.startsWith(prefix)).forEach(keyToRemove => delete this._values[keyToRemove]);
    } else {
      // remove all keys
      this._values = {version: this._version};
    }

    this.save();
  }

  disableAll(disabled = true) {
    this._disabled = disabled;
    this._notify.next();
  }

  private _isCompleteMatch(name: string, value: any) {
    const src = this.getTaskCompleted(name);
    return this._isEqual(src, value) || (typeof(value) === 'object' && _.isMatch(src, value));
  }

  private _isEqual(src: any, value: any) {
    if (src === value) {
      return true;
    } else if (src !== false && value === true) {
      // we can compare value of true with any source
      return true;
    } else if (typeof(value) === 'string') {
      // support not (!) less than (<) or greater than (>) comparisons
      const op = value[0];
      const compValue = value.substr(1);

      if ((op === '!' && compValue != src) || (op === '<' && src < compValue) || (op === '>' && src > compValue)) {
        return true;
      }
    }
  }

  evalMustCompleted(mustCompleted: TaskList) {
    return Object.entries(mustCompleted).find(([name, value]) => !this._isCompleteMatch(name, value)) === undefined;
  }

  evalMustNotDisplaying(mustNotDisplaying: string[]) {
    // allow using prefix in task names
    const displaying = Object.keys(this._displaying);
    return mustNotDisplaying.find(prefix => displaying.find(key => key.startsWith(prefix))) === undefined;
  }

  private save() {
    localStorage.setItem(this._key, JSON.stringify(this._values));
    this._notify.next();
  }
}

export interface TaskList { [taskName: string]: any | boolean; }

export interface BdcWalkMigration {
  version: number;
  operations: {
    condition: TaskList,
    then: TaskList
  }[];
}

export interface BdcDisplayEvent {
  id: string;
  visible: boolean;
  action: BdcDisplayEventAction;
}

export enum BdcDisplayEventAction {
  VisibilityChanged,
  UserClosed,
  ButtonClicked
}
