import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth10Guard } from './auth10.guard';

describe('auth10Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth10Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
