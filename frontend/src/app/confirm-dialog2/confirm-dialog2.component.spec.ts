import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialog2Component } from './confirm-dialog2.component';

describe('ConfirmDialog2Component', () => {
  let component: ConfirmDialog2Component;
  let fixture: ComponentFixture<ConfirmDialog2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
