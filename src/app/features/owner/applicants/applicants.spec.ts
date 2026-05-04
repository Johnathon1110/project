import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Applicants } from './applicants';

describe('Applicants', () => {
  let component: Applicants;
  let fixture: ComponentFixture<Applicants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Applicants],
    }).compileComponents();

    fixture = TestBed.createComponent(Applicants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
