import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {Example1Component} from './example1/example1.component';
import {Example2Component} from './example2/example2.component';
import {Example3Component} from './example3/example3.component';
import {Example4Component} from './example4/example4.component';
import {Example5Component} from './example5/example5.component';
import {Example6Component} from './example6/example6.component';

const routes: Routes = [
  { path: 'example1', component: Example1Component },
  { path: 'example2', component: Example2Component },
  { path: 'example3', component: Example3Component },
  { path: 'example4', component: Example4Component },
  { path: 'example5', component: Example5Component },
  { path: 'example6', component: Example6Component },
  { path: '', redirectTo: '/example1', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
