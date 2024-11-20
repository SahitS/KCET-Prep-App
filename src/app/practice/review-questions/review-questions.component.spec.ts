import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewQuestionsComponent } from './review-questions.component';

describe('ReviewQuestionsComponent', () => {
  let component: ReviewQuestionsComponent;
  let fixture: ComponentFixture<ReviewQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
