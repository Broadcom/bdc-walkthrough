import { Component, OnInit } from '@angular/core';
import {BdcWalkService} from 'bdc-walkthrough-lib';

@Component({
  selector: 'bdc-example1',
  templateUrl: './example1.component.html',
  styleUrls: ['./example1.component.scss']
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
