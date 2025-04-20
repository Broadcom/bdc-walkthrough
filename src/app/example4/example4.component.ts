import { Component, OnInit } from '@angular/core';
import { BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective } from 'bdc-walkthrough';
import { MatFormField, MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'bdc-example4',
  templateUrl: './example4.component.html',
  styleUrls: ['./example4.component.scss'],
  imports: [BdcWalkTriggerDirective, BdcWalkPopupComponent, MatFormField, MatInput, MatButtonModule, FormsModule, NgForOf]
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
