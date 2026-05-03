import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user.model';

export const routes: Routes = [
  // Public
  {
    path: '',
    loadComponent: () => import('./features/layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent) }
    ]
  },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/public/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/public/register/register.component').then(m => m.RegisterComponent) },
  { path: 'setup-profile', canActivate: [authGuard], loadComponent: () => import('./features/shared/first-login/first-login.component').then(m => m.FirstLoginComponent) },

  // Candidate (Student)
  {
    path: 'candidate',
    canActivate: [authGuard, roleGuard(Role.STUDENT)],
    loadComponent: () => import('./features/layouts/candidate-layout/candidate-layout.component').then(m => m.CandidateLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/candidate/dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent) },
      { path: 'projects', redirectTo: 'applications', pathMatch: 'full' },
      { path: 'projects/new', loadComponent: () => import('./features/candidate/project-submit/project-submit.component').then(m => m.ProjectSubmitComponent) },
      { path: 'sessions', loadComponent: () => import('./features/candidate/sessions-explorer/sessions-explorer.component').then(m => m.SessionsExplorerComponent) },
      { path: 'applications', loadComponent: () => import('./features/candidate/my-applications/my-applications.component').then(m => m.MyApplicationsComponent) },
      { path: 'events', loadComponent: () => import('./features/candidate/events/candidate-events.component').then(m => m.CandidateEventsComponent) },
      { path: 'profile', loadComponent: () => import('./features/shared/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  // Evaluator
  {
    path: 'evaluator',
    canActivate: [authGuard, roleGuard(Role.EVALUATOR, Role.ADMIN)],
    loadComponent: () => import('./features/layouts/evaluator-layout/evaluator-layout.component').then(m => m.EvaluatorLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/evaluator/dashboard/evaluator-dashboard.component').then(m => m.EvaluatorDashboardComponent) },
      { path: 'sessions', loadComponent: () => import('./features/evaluator/sessions/eval-sessions.component').then(m => m.EvalSessionsComponent) },
      { path: 'sessions/:id', loadComponent: () => import('./features/evaluator/session-detail/session-detail.component').then(m => m.SessionDetailComponent) },
      { path: 'sessions/:id/applicants', loadComponent: () => import('./features/evaluator/applicants/applicants.component').then(m => m.ApplicantsComponent) },
      { path: 'sessions/:id/rounds/:roundId/applicants', loadComponent: () => import('./features/evaluator/applicants/applicants.component').then(m => m.ApplicantsComponent) },
      { path: 'sessions/:id/rounds/:roundId/selection', loadComponent: () => import('./features/evaluator/round-selection/round-selection.component').then(m => m.RoundSelectionComponent) },
      { path: 'profile', loadComponent: () => import('./features/shared/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(Role.ADMIN)],
    loadComponent: () => import('./features/layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'programs', loadComponent: () => import('./features/admin/programs/admin-programs.component').then(m => m.AdminProgramsComponent) },
      { path: 'sessions', loadComponent: () => import('./features/evaluator/sessions/eval-sessions.component').then(m => m.EvalSessionsComponent) },
      { path: 'sessions/:id', loadComponent: () => import('./features/evaluator/session-detail/session-detail.component').then(m => m.SessionDetailComponent) },
      { path: 'sessions/:id/applicants', loadComponent: () => import('./features/evaluator/applicants/applicants.component').then(m => m.ApplicantsComponent) },
      { path: 'sessions/:id/rounds/:roundId/applicants', loadComponent: () => import('./features/evaluator/applicants/applicants.component').then(m => m.ApplicantsComponent) },
      { path: 'sessions/:id/rounds/:roundId/selection', loadComponent: () => import('./features/evaluator/round-selection/round-selection.component').then(m => m.RoundSelectionComponent) },
      { path: 'events', loadComponent: () => import('./features/admin/events/admin-events.component').then(m => m.AdminEventsComponent) },
      { path: 'news', loadComponent: () => import('./features/admin/news/admin-news.component').then(m => m.AdminNewsComponent) }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
