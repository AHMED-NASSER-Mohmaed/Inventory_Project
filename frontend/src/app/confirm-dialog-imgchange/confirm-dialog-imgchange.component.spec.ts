import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogImgchangeComponent } from './confirm-dialog-imgchange.component';

describe('ConfirmDialogImgchangeComponent', () => {
  let component: ConfirmDialogImgchangeComponent;
  let fixture: ComponentFixture<ConfirmDialogImgchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogImgchangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogImgchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
