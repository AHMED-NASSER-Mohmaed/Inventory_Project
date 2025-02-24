import { TestBed } from '@angular/core/testing';

import { CashiersService } from './cashiers.service';

describe('CashiersService', () => {
  let service: CashiersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashiersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
