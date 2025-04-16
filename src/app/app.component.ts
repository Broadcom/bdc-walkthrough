import { Component } from '@angular/core';
import { BdcWalkDialogComponent } from '../../projects/bdc-walkthrough/src/lib/tutorial-dialog/tutorial-dialog.component';
import { MatDialogContent } from '@angular/material/dialog';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'bdc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [BdcWalkDialogComponent, MatDialogContent, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule]
})
export class AppComponent {

}
