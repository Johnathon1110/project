import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedWorkers } from './recommended-workers';

describe('RecommendedWorkers', () => {
  let component: RecommendedWorkers;
  let fixture: ComponentFixture<RecommendedWorkers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedWorkers],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendedWorkers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
