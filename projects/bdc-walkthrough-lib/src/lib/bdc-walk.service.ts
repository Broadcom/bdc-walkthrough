import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class BdcWalkService {
  private _notify = new BehaviorSubject<void>(null);
  private _values: {[id: string]: any | boolean};
  private _displaying: {[id: string]: boolean} = {};
  private _version = 1;
  private _key = 'bdcWalkthrough';

  changes = this._notify.asObservable();

  constructor() {
    this._values = JSON.parse(localStorage.getItem(this._key)) || {};

    // reset all values if version is different
    if (this._values.version !== this._version) {
      this.reset();
    }
  }

  getIsDisplaying(id: string): boolean {
    return this._displaying[id] || false;
  }

  setIsDisplaying(id: string, visible: boolean) {
    if (this._displaying[id] !== visible) {
      this._displaying[id] = visible;
      this._notify.next();
    }
  }

  getTaskCompleted(id: string): any | boolean {
    return this._values[id] || false;
  }

  setTaskCompleted(id: string, data: any | boolean = true) {
    if (this._values[id] !== data && data) {
      this._values[id] = data;
      this.save();
    } else if (this._values.hasOwnProperty(id) && !data) {
      delete this._values[id];
      this.save();
    }
  }

  setTasks(tasks: { [taskName: string]: any | boolean }) {
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

  private _isCompleteMatch(name: string, value: any) {
    const curValue = this.getTaskCompleted(name);
    return curValue === value || (value === true && curValue !== false) || (typeof(value) === 'object' && _.isMatch(curValue, value));
  }

  evalMustCompleted(mustCompleted: { [taskName: string]: any | boolean }) {
    return Object.entries(mustCompleted).find(([name, value]) => !this._isCompleteMatch(name, value)) === undefined;
  }

  evalMustNotDisplaying(mustNotDisplaying: string[]) {
    return mustNotDisplaying.find(name => this.getIsDisplaying(name)) === undefined;
  }

  private save() {
    localStorage.setItem(this._key, JSON.stringify(this._values));
    this._notify.next();
  }
}
