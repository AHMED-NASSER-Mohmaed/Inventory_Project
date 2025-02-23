import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCompeleteComponent } from './order-compelete.component';

describe('OrderCompeleteComponent', () => {
  let component: OrderCompeleteComponent;
  let fixture: ComponentFixture<OrderCompeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCompeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderCompeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
