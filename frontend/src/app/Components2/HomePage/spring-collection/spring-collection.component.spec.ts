import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpringCollectionComponent } from './spring-collection.component';

describe('SpringCollectionComponent', () => {
  let component: SpringCollectionComponent;
  let fixture: ComponentFixture<SpringCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpringCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpringCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
