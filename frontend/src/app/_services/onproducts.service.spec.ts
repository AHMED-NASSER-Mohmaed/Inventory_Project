import { TestBed } from '@angular/core/testing';

import { OnproductsService } from './onproducts.service';

describe('OnproductsService', () => {
  let service: OnproductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnproductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
