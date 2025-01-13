import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LessonsComponent } from './lessons/lessons.component';
import { PracticeComponent } from './practice/practice.component';
import { ProgressComponent } from './progress/progress.component';
import { AccountComponent } from './account/account.component';
import { PracticeTestComponent } from './practice/practice-test/practice-test.component';
import { CustomPracticeComponent } from './practice/custom-practice/custom-practice.component';
import { ReviewQuestionsComponent } from './practice/review-questions/review-questions.component';
import { ShowResultComponent } from './practice/show-result/show-result.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudyPlanComponent } from './practice/study-plan/study-plan.component';
import { MathLessonsComponent } from './lessons/math-lessons/math-lessons.component';
import { ChemistryLessonsComponent } from './lessons/chemistry-lessons/chemistry-lessons.component';
import { PhysicsLessonsComponent } from './lessons/physics-lessons/physics-lessons.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component:DashboardComponent, canActivate: [AuthGuard]},
  { path: 'lessons', component: LessonsComponent, canActivate: [AuthGuard] },
  { path: 'practice', component: PracticeComponent, canActivate: [AuthGuard] },
  { path: 'progress', component: ProgressComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'practice-test', component: PracticeTestComponent, canActivate: [AuthGuard] },
  { path: 'custom-practice', component: CustomPracticeComponent, canActivate: [AuthGuard] },
  { path: 'review-questions', component: ReviewQuestionsComponent, canActivate: [AuthGuard] },
  { path: 'study-plan', component: StudyPlanComponent, canActivate: [AuthGuard] },
  { path: 'results', component: ShowResultComponent },
  { path: 'math-lessons', component: MathLessonsComponent},
  { path: 'chemistry-lessons', component: ChemistryLessonsComponent},
  { path: 'physics-lessons', component: PhysicsLessonsComponent},
  { path: '', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'home' },
];
