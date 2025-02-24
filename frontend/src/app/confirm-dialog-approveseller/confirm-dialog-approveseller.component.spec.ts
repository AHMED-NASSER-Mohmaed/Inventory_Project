import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogApprovesellerComponent } from './confirm-dialog-approveseller.component';

describe('ConfirmDialogApprovesellerComponent', () => {
  let component: ConfirmDialogApprovesellerComponent;
  let fixture: ComponentFixture<ConfirmDialogApprovesellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogApprovesellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogApprovesellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
