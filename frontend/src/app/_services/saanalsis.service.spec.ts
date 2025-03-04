import { TestBed } from '@angular/core/testing';

import { SAanalsisService } from './saanalsis.service';

describe('SAanalsisService', () => {
  let service: SAanalsisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SAanalsisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
