import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoExerciceComponent } from './info-exercice.component';

describe('InfoExerciceComponent', () => {
  let component: InfoExerciceComponent;
  let fixture: ComponentFixture<InfoExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoExerciceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
