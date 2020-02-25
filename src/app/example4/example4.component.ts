import { Component, OnInit } from '@angular/core';
import {BdcWalkService} from 'bdc-walkthrough';

@Component({
  selector: 'bdc-example4',
  templateUrl: './example4.component.html',
  styleUrls: ['./example4.component.scss']
})
export class Example4Component implements OnInit {
  input = '';

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.bdcWalkService.reset('example4');
  }

  isValid() {
    const num = Number(this.input);
    return num >= 1 && num <= 10;
  }

  setTask() {
    // programmatically set a task to a value
    const num = Number(this.input);
    this.bdcWalkService.setTaskCompleted('example4Value', num);
  }
}
