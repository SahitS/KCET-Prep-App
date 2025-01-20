import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockTestComponent } from './mock-test.component';

describe('MockTestComponent', () => {
  let component: MockTestComponent;
  let fixture: ComponentFixture<MockTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MockTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
