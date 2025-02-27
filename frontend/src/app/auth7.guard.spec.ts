import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth7Guard } from './auth7.guard';

describe('auth7Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth7Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
