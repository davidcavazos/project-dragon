import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainDialogComponent } from './train-dialog.component';

describe('TrainDialogComponent', () => {
  let component: TrainDialogComponent;
  let fixture: ComponentFixture<TrainDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
