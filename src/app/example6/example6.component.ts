import {Component, OnDestroy, OnInit} from '@angular/core';
import {BdcWalkService} from 'bdc-walkthrough-lib';
import {Subscription} from 'rxjs';

@Component({
  selector: 'bdc-example6',
  templateUrl: './example6.component.html',
  styleUrls: ['./example6.component.scss']
})
export class Example6Component implements OnInit, OnDestroy {
  id = 'example6showWalkthrough';
  visible = true;
  componentSubscription: Subscription;

  tasks = [
    {name: 'example6Task1', title: 'Task 1', done: false},
    {name: 'example6Task2', title: 'Task 2', done: false},
    {name: 'example6Task3', title: 'Task 3', done: false},
    {name: 'example6Task4', title: 'Task 4', done: false}
  ];

  constructor(private bdcWalkService: BdcWalkService) {
  }

  ngOnInit() {
    this.componentSubscription = this.bdcWalkService.changes.subscribe(() => this.onTaskChanges());
  }

  ngOnDestroy() {
    this.componentSubscription.unsubscribe();
  }

  onTaskChanges() {
    // refresh the status of each task
    this.tasks.forEach(task => task.done = this.bdcWalkService.getTaskCompleted(task.name));
    this.visible = this.bdcWalkService.getTaskCompleted(this.id);
  }

  toggleShowWalkthough(visible: boolean) {
    this.bdcWalkService.setTaskCompleted(this.id, visible);
  }

  reset() {
    this.bdcWalkService.reset('example6');
  }
}
