import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { auth8Guard } from './auth8.guard';

describe('auth8Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => auth8Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
