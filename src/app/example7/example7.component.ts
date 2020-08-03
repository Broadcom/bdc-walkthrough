import { Component, OnInit } from '@angular/core';
import {BdcWalkService} from 'bdc-walkthrough';

@Component({
  selector: 'bdc-example7',
  templateUrl: './example7.component.html',
  styleUrls: ['./example7.component.scss']
})
export class Example7Component implements OnInit {

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.reset();
  }

  migrate() {
    this.bdcWalkService.migrate([
      {
        version: 1,
        operations: [
          {condition: {}, then: {example7Temp: true}},
          {condition: {example7Step2: true}, then: {example7Step3: true}}
        ]
      },
      {
        version: 2,
        operations: [
          // support not (!) less than (<) or greater than (>) comparisons
          {condition: {example7Count: '>3'}, then: {example7Temp2: true, example7Count: 10}},
          {condition: {example7Step2: true, example7Step3: true}, then: {example7Step4: true}}
        ]
      }
    ]);
  }

  reset() {
    this.bdcWalkService.reset('example7');
    this.bdcWalkService.setTasks({example7Step1: true, example7Step2: true, example7Count: 5, migrationVersion: false});
  }
}
