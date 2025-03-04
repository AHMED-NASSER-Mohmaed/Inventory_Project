import { TestBed } from '@angular/core/testing';

import { SellerAnalyticsService } from './seller-analytics.service';

describe('SellerAnalyticsService', () => {
  let service: SellerAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
