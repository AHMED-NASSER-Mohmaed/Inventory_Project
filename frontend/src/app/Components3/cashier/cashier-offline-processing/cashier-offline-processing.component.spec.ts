import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierOfflineProcessingComponent } from './cashier-offline-processing.component';

describe('CashierOfflineProcessingComponent', () => {
  let component: CashierOfflineProcessingComponent;
  let fixture: ComponentFixture<CashierOfflineProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierOfflineProcessingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierOfflineProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
