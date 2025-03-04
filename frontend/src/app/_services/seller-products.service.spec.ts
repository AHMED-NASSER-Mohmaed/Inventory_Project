import { TestBed } from '@angular/core/testing';

import { SellerProductsService } from './seller-products.service';

describe('SellerProductsService', () => {
  let service: SellerProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
