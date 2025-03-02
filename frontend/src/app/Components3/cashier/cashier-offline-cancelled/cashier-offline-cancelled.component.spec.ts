import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierOfflineCancelledComponent } from './cashier-offline-cancelled.component';

describe('CashierOfflineCancelledComponent', () => {
  let component: CashierOfflineCancelledComponent;
  let fixture: ComponentFixture<CashierOfflineCancelledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierOfflineCancelledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierOfflineCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
