import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth4Guard } from './auth4.guard';

describe('auth4Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth4Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
