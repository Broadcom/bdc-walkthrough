import { Component, OnInit } from '@angular/core';
import { BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective } from 'bdc-walkthrough';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'bdc-example5',
  templateUrl: './example5.component.html',
  styleUrls: ['./example5.component.scss'],
  imports: [BdcWalkTriggerDirective, BdcWalkPopupComponent, MatCheckbox, FormsModule, NgClass]
})
export class Example5Component implements OnInit {
  horizontal = false;
  alignCenter = false;
  arrow = true;

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.bdcWalkService.reset('example5');
  }
}
