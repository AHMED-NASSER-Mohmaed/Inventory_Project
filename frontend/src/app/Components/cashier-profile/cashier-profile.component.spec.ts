import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierProfileComponent } from './cashier-profile.component';

describe('CashierProfileComponent', () => {
  let component: CashierProfileComponent;
  let fixture: ComponentFixture<CashierProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
