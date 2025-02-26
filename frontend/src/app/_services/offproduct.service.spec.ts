import { TestBed } from '@angular/core/testing';

import { OffproductService } from './offproduct.service';

describe('OffproductService', () => {
  let service: OffproductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OffproductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
