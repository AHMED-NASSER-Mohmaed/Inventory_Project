import { TestBed } from '@angular/core/testing';

import { OfflineClerkCashierService } from './offline-clerk-cashier.service';

describe('OfflineClerkCashierService', () => {
  let service: OfflineClerkCashierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineClerkCashierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
