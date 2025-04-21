import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelExerciceComponent } from './level-exercice.component';

describe('LevelExerciceComponent', () => {
  let component: LevelExerciceComponent;
  let fixture: ComponentFixture<LevelExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelExerciceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
