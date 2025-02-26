import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffproductComponent } from './offproduct.component';

describe('OffproductComponent', () => {
  let component: OffproductComponent;
  let fixture: ComponentFixture<OffproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
