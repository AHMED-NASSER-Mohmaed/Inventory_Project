import { TestBed } from '@angular/core/testing';

import { ClerksService } from './clerks.service';

describe('ClerksService', () => {
  let service: ClerksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClerksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
