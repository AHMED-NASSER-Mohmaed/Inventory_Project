import { TestBed } from '@angular/core/testing';

import { AddProductsForSellerService } from './add-products-for-seller.service';

describe('AddProductsForSellerService', () => {
  let service: AddProductsForSellerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddProductsForSellerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
