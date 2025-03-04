import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalticsComponent } from './analtics.component';

describe('AnalticsComponent', () => {
  let component: AnalticsComponent;
  let fixture: ComponentFixture<AnalticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
