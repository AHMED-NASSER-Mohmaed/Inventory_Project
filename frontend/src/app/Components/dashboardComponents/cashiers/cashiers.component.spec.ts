import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashiersComponent } from './cashiers.component';

describe('CashiersComponent', () => {
  let component: CashiersComponent;
  let fixture: ComponentFixture<CashiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashiersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
