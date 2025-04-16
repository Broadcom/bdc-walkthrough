import { Component, OnInit } from '@angular/core';
import { BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective } from 'bdc-walkthrough';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'bdc-example1',
  templateUrl: './example1.component.html',
  styleUrls: ['./example1.component.scss'],
  imports: [BdcWalkTriggerDirective, BdcWalkPopupComponent, MatButtonModule]
})
export class Example1Component implements OnInit {

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
  }

  reset() {
    this.bdcWalkService.reset('example1');
  }
}
