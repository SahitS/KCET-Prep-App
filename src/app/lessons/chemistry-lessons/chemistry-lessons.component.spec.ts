import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemistryLessonsComponent } from './chemistry-lessons.component';

describe('ChemistryLessonsComponent', () => {
  let component: ChemistryLessonsComponent;
  let fixture: ComponentFixture<ChemistryLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemistryLessonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemistryLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
