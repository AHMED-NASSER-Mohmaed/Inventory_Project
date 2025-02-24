import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth5Guard } from './auth5.guard';

describe('auth5Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth5Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
