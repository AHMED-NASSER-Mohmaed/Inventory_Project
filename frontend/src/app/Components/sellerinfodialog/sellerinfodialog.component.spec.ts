import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerinfodialogComponent } from './sellerinfodialog.component';

describe('SellerinfodialogComponent', () => {
  let component: SellerinfodialogComponent;
  let fixture: ComponentFixture<SellerinfodialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerinfodialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerinfodialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
