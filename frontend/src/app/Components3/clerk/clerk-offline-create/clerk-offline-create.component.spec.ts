import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkOfflineCreateComponent } from './clerk-offline-create.component';

describe('ClerkOfflineCreateComponent', () => {
  let component: ClerkOfflineCreateComponent;
  let fixture: ComponentFixture<ClerkOfflineCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClerkOfflineCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClerkOfflineCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
