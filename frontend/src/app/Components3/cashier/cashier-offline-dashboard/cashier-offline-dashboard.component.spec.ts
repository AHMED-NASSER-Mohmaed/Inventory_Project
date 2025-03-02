import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierOfflineDashboardComponent } from './cashier-offline-dashboard.component';

describe('CashierOfflineDashboardComponent', () => {
  let component: CashierOfflineDashboardComponent;
  let fixture: ComponentFixture<CashierOfflineDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierOfflineDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierOfflineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
