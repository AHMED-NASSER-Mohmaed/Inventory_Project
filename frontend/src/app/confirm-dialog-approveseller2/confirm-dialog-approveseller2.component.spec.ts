import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogApproveseller2Component } from './confirm-dialog-approveseller2.component';

describe('ConfirmDialogApproveseller2Component', () => {
  let component: ConfirmDialogApproveseller2Component;
  let fixture: ComponentFixture<ConfirmDialogApproveseller2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogApproveseller2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogApproveseller2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
