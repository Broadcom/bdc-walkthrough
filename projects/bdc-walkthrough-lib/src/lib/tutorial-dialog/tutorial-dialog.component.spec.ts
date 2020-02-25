import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {BdcWalkDialogComponent} from './tutorial-dialog.component';


describe('BdcWalkDialogComponent', () => {
  let component: BdcWalkDialogComponent;
  let fixture: ComponentFixture<BdcWalkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BdcWalkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdcWalkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
