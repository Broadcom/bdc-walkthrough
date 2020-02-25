import { Component, OnInit } from '@angular/core';
import {BdcWalkService} from '../../../projects/bdc-walkthrough-lib/src/lib/bdc-walk.service';

@Component({
  selector: 'bdc-example5',
  templateUrl: './example5.component.html',
  styleUrls: ['./example5.component.scss']
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
