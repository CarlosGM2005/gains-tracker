import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LevelExerciceComponent } from './components/level-exercice/level-exercice.component';
import { MainComponent } from './components/main/main.component';
import { ExercicesComponent } from './components/exercices/exercices.component';
import { InfoExerciceComponent } from './components/info-exercice/info-exercice.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent  // Esta será la pantalla inicial
  },
  {
    path: 'main',
    component: AuthLayoutComponent,
    children: [
      { path: '', component: MainComponent },
      { path: 'level-exercice', component: LevelExerciceComponent },
    ]
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    children: [
      { path: 'exercices/:level', component: ExercicesComponent },
      { path: 'info-exercice', component: InfoExerciceComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

