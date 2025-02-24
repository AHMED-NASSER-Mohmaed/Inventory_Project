import { TestBed } from '@angular/core/testing';

import { ClerkDashboardService } from './clerk-dashboard.service';

describe('ClerkDashboardService', () => {
  let service: ClerkDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClerkDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
