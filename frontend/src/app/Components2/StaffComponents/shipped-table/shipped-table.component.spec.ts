import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippedTableComponent } from './shipped-table.component';

describe('ShippedTableComponent', () => {
  let component: ShippedTableComponent;
  let fixture: ComponentFixture<ShippedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
