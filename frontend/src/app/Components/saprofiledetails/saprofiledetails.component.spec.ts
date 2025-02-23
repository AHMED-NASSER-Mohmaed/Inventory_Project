import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAprofiledetailsComponent } from './saprofiledetails.component';

describe('SAprofiledetailsComponent', () => {
  let component: SAprofiledetailsComponent;
  let fixture: ComponentFixture<SAprofiledetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SAprofiledetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SAprofiledetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
