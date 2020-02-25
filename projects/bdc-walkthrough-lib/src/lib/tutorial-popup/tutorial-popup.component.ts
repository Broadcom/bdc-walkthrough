import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatMenu, MenuPositionX, MenuPositionY} from '@angular/material/menu';
import {BdcWalkService} from '../bdc-walk.service';
import {BdcWalkTriggerDirective} from './tutorial-trigger.directive';

@Component({
  selector: 'bdc-walk-popup',
  templateUrl: './tutorial-popup.component.html',
  styleUrls: ['./tutorial-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BdcWalkPopupComponent implements OnInit, OnChanges {
  @Input() name: string;
  @Input() header: string;
  @Input() xPosition: MenuPositionX = 'before';
  @Input() yPosition: MenuPositionY = 'below';
  @Input() arrow = true;
  @Input() horizontal = false;
  @Input() closeOnClick = false;
  @Input() alignCenter: boolean | undefined; // by default only if size < 70 it will auto-align to center
  @Input() offsetX = 0;
  @Input() offsetY = 0;
  @Input() showCloseButton = true;
  @Input() showButton = false;
  @Input() buttonText = 'Got it';
  @Input() mustCompleted: { [taskName: string]: any | boolean } = {};
  @Input() mustNotDisplaying: string[] = [];
  @Input() onCloseCompleteTask: { [taskName: string]: any | boolean } = {};
  @Input() onButtonCompleteTask: { [taskName: string]: any | boolean } = {};
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild(MatMenu, { static: true }) menu: MatMenu;
  @ContentChild(TemplateRef, {static: false}) templateRef: TemplateRef<any>;

  trigger: BdcWalkTriggerDirective;
  data: any;

  constructor(private tutorialService: BdcWalkService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.trigger) {
      this.trigger.reposition();
    }
  }

  _getClass() {
    return 'bdc-walk-popup' + (this.arrow ? ' arrow' : '') + (this.horizontal ? ' horizontal' : '');
  }

  getValue(taskName: string): any {
    return this.tutorialService.getTaskCompleted(taskName);
  }
}
