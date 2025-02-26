import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledTableComponent } from './cancelled-table.component';

describe('CancelledTableComponent', () => {
  let component: CancelledTableComponent;
  let fixture: ComponentFixture<CancelledTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelledTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelledTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
