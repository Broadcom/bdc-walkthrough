import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {BdcWalkService} from '../bdc-walk.service';

@Component({
  selector: 'bdc-walk-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BdcWalkDialogComponent implements AfterContentInit, OnDestroy, OnChanges {
  @Input() name: string;
  @Input() mustCompleted: { [taskName: string]: any | boolean } = {};
  @Input() mustNotDisplaying: string[] = [];
  @Input() width = '500px';
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild(TemplateRef, {static: true}) templateRef: TemplateRef<any>;

  dialogRef: MatDialogRef<any>;
  componentSubscription: Subscription;

  constructor(private dialog: MatDialog,
              private tutorialService: BdcWalkService) { }

  ngAfterContentInit() {
    this.componentSubscription = this.tutorialService.changes.subscribe(() => this._sync());
  }

  ngOnChanges(): void {
    this._sync();
  }

  ngOnDestroy() {
    if (this.componentSubscription) {
      this.componentSubscription.unsubscribe();
    }

    this._close();
  }

  getValue(taskName: string): any {
    return this.tutorialService.getTaskCompleted(taskName);
  }

  close(setTasks: { [taskName: string]: any | boolean } = {}) {
    this.tutorialService.setTaskCompleted(this.name);
    this.tutorialService.setTasks(setTasks);
  }

  private _open() {
    this.dialogRef = this.dialog.open(this.templateRef, {width: this.width, disableClose: true, restoreFocus: false, panelClass: 'bdc-walk-dialog'});
    this.opened.emit();
  }

  private _close() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
      this.closed.emit();
    }
  }

  private _sync() {
    if (this.name) {
      if (!this.tutorialService.getTaskCompleted(this.name) &&
        this.tutorialService.evalMustCompleted(this.mustCompleted) &&
        this.tutorialService.evalMustNotDisplaying(this.mustNotDisplaying)) {

        if (!this.dialogRef) {
          this._open();
          this.tutorialService.setIsDisplaying(this.name, true);
        }
      } else if (this.dialogRef) {
        this._close();
        this.tutorialService.setIsDisplaying(this.name, false);
      }
    }
  }
}
