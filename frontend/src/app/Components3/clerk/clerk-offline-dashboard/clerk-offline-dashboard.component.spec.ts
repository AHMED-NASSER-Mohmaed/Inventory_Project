import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkOfflineDashboardComponent } from './clerk-offline-dashboard.component';

describe('ClerkOfflineDashboardComponent', () => {
  let component: ClerkOfflineDashboardComponent;
  let fixture: ComponentFixture<ClerkOfflineDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClerkOfflineDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClerkOfflineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
