import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
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
