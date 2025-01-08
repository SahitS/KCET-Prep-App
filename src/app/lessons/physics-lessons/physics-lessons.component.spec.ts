import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicsLessonsComponent } from './physics-lessons.component';

describe('PhysicsLessonsComponent', () => {
  let component: PhysicsLessonsComponent;
  let fixture: ComponentFixture<PhysicsLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhysicsLessonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicsLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
