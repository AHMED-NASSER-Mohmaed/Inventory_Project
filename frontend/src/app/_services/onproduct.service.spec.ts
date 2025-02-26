import { TestBed } from '@angular/core/testing';

import { OnproductService } from './onproduct.service';

describe('OnproductService', () => {
  let service: OnproductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnproductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
