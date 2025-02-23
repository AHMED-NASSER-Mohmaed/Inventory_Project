import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CprofiledetailsComponent } from './cprofiledetails.component';

describe('CprofiledetailsComponent', () => {
  let component: CprofiledetailsComponent;
  let fixture: ComponentFixture<CprofiledetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CprofiledetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CprofiledetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
