import { Component, OnInit } from '@angular/core';
import { BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective } from 'bdc-walkthrough';

@Component({
  selector: 'bdc-example2',
  templateUrl: './example2.component.html',
  styleUrls: ['./example2.component.scss'],
  imports: [BdcWalkTriggerDirective, BdcWalkPopupComponent]
})
export class Example2Component implements OnInit {

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
  }

  reset() {
    this.bdcWalkService.reset('example2');
  }
}
