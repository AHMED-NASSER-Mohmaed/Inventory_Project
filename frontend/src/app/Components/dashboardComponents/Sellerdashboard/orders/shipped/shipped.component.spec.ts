import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippedComponent } from './shipped.component';

describe('ShippedComponent', () => {
  let component: ShippedComponent;
  let fixture: ComponentFixture<ShippedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
