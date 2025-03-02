import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierOfflineCompleteComponent } from './cashier-offline-complete.component';

describe('CashierOfflineCompleteComponent', () => {
  let component: CashierOfflineCompleteComponent;
  let fixture: ComponentFixture<CashierOfflineCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierOfflineCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierOfflineCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
