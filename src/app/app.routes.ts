import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LessonsComponent } from './lessons/lessons.component';
import { PracticeComponent } from './practice/practice.component';
import { ProgressComponent } from './progress/progress.component';
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'lessons', component: LessonsComponent },
  { path: 'practice', component: PracticeComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'dashboard', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }, // Catch-all route for invalid paths
];
