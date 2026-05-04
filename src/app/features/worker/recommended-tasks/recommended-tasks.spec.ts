import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedTasks } from './recommended-tasks';

describe('RecommendedTasks', () => {
  let component: RecommendedTasks;
  let fixture: ComponentFixture<RecommendedTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendedTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
