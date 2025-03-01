import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth9Guard } from './auth9.guard';

describe('auth9Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth9Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
