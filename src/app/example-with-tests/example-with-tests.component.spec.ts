import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleWithTestsComponent } from './example-with-tests.component';
import { BdcWalkModule } from 'bdc-walkthrough';

describe('ExampleWithTestsComponent', () => {
  let component: ExampleWithTestsComponent;
  let fixture: ComponentFixture<ExampleWithTestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExampleWithTestsComponent ],
      imports: [
        BdcWalkModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleWithTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
