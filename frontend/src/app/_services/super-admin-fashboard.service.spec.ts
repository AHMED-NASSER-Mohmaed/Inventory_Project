import { TestBed } from '@angular/core/testing';

import { SuperAdminFashboardService } from './super-admin-fashboard.service';

describe('SuperAdminFashboardService', () => {
  let service: SuperAdminFashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperAdminFashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
