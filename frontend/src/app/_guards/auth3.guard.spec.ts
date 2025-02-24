import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth3Guard } from './auth3.guard';

describe('auth3Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth3Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
