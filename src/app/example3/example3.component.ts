import { Component, OnInit } from '@angular/core';
import {BdcWalkService} from 'bdc-walkthrough';

@Component({
  selector: 'bdc-example3',
  templateUrl: './example3.component.html',
  styleUrls: ['./example3.component.scss']
})
export class Example3Component implements OnInit {
  input = '';

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.bdcWalkService.reset('example3');
  }
}
