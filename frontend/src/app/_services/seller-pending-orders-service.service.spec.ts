import { TestBed } from '@angular/core/testing';

import { SellerPendingOrdersServiceService } from './seller-pending-orders-service.service';

describe('SellerPendingOrdersServiceService', () => {
  let service: SellerPendingOrdersServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerPendingOrdersServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
