import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogRejectsellerComponent } from './confirm-dialog-rejectseller.component';

describe('ConfirmDialogRejectsellerComponent', () => {
  let component: ConfirmDialogRejectsellerComponent;
  let fixture: ComponentFixture<ConfirmDialogRejectsellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogRejectsellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogRejectsellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
