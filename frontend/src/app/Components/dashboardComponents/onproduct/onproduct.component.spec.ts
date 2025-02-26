import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnproductComponent } from './onproduct.component';

describe('OnproductComponent', () => {
  let component: OnproductComponent;
  let fixture: ComponentFixture<OnproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
