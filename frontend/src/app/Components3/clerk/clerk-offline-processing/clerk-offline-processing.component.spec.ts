import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkOfflineProcessingComponent } from './clerk-offline-processing.component';

describe('ClerkOfflineProcessingComponent', () => {
  let component: ClerkOfflineProcessingComponent;
  let fixture: ComponentFixture<ClerkOfflineProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClerkOfflineProcessingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClerkOfflineProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
