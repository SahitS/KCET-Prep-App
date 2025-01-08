import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MathLessonsComponent } from './math-lessons.component';

describe('MathLessonsComponent', () => {
  let component: MathLessonsComponent;
  let fixture: ComponentFixture<MathLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathLessonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MathLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
