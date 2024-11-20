import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeTestComponent } from './practice-test.component';

describe('PracticeTestComponent', () => {
  let component: PracticeTestComponent;
  let fixture: ComponentFixture<PracticeTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
