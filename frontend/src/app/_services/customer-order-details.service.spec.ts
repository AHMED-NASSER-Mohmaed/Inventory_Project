import { TestBed } from '@angular/core/testing';

import { CustomerOrderDetailsService } from './customer-order-details.service';

describe('CustomerOrderDetailsService', () => {
  let service: CustomerOrderDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerOrderDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
