import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchdeactivatewarningComponent } from './branchdeactivatewarning.component';

describe('BranchdeactivatewarningComponent', () => {
  let component: BranchdeactivatewarningComponent;
  let fixture: ComponentFixture<BranchdeactivatewarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchdeactivatewarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchdeactivatewarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
