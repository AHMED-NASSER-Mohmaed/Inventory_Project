import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth6Guard } from './auth6.guard';

describe('auth6Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth6Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
