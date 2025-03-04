import { TestBed } from '@angular/core/testing';

import { AdminDashOrdersService } from './admin-dash-orders.service';

describe('AdminDashOrdersService', () => {
  let service: AdminDashOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminDashOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
