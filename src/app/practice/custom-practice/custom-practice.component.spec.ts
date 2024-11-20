import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPracticeComponent } from './custom-practice.component';

describe('CustomPracticeComponent', () => {
  let component: CustomPracticeComponent;
  let fixture: ComponentFixture<CustomPracticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPracticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPracticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
