// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideRouter, Route } from '@angular/router';

// define lazy-loaded routes
const routes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },  // Redirect from '' (root) to 'dashboard'
  {
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'main',
    loadComponent: () => import('./features/a-main-page/a-main-page.component')
      .then(m => m.AMainPageComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/signup/signup.component')
      .then(m => m.SignupComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/user-management/user-management.component')
      .then(m => m.UserManagementComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('./features/activity-logs/activity-logs.component')
      .then(m => m.ActivityLogsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/system-settings/system-settings.component')
      .then(m => m.SystemSettingsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component')
      .then(m => m.ReportsComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component')
      .then(m => m.NotificationsComponent)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./features/inventory/inventory.component')
      .then(m => m.InventoryComponent)
  },
  {
    path: 'report-problem',
    loadComponent: () => import('./features/report-problem/report-problem.component')
      .then(m => m.ReportProblemComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component')
      .then(m => m.LoginComponent)
  },
  { path: '**', redirectTo: 'dashboard' }  // Wildcard route, to handle any unmatched paths
];

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideRouter(routes)  // Inject the router with the defined routes
  ]
}).catch(err => console.error(err));
