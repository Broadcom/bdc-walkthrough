import { Component, OnInit } from '@angular/core';
import { BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective } from 'bdc-walkthrough';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';

@Component({
  selector: 'bdc-example3',
  templateUrl: './example3.component.html',
  styleUrls: ['./example3.component.scss'],
  imports: [BdcWalkTriggerDirective, BdcWalkPopupComponent, MatFormField, FormsModule, MatInput, NgIf]

})
export class Example3Component implements OnInit {
  input = '';

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.bdcWalkService.reset('example3');
  }
}
