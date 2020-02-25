import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatDialogModule, MatMenuModule} from '@angular/material';
import {BdcWalkDialogComponent} from './tutorial-dialog/tutorial-dialog.component';
import {BdcWalkPopupComponent} from './tutorial-popup/tutorial-popup.component';
import {BdcWalkTriggerDirective} from './tutorial-popup/tutorial-trigger.directive';

@NgModule({
  declarations: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective],
  imports: [
    CommonModule, MatButtonModule, MatDialogModule, MatMenuModule
  ],
  exports: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective]
})
export class BdcWalkModule { }
