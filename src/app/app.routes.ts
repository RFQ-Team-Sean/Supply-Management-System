import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import {UserManagementComponent} from '../features/user-management/user-management.component';
import {ActivityLogsComponent} from'../features/activity-logs/activity-logs.component';
import {SystemSettingsComponent} from '../features/system-settings/system-settings.component';
import {ReportsComponent} from'../features/reports/reports.component';
import {NotificationsComponent} from '../features/notifications/notifications.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
  },
  {
    path: 'user-management',    
  },
  {
    path: 'activity-logs',
      
  },
  {
    path: 'system-settings',
  },
  {
    path: 'reports',
  },
  {
    path: 'notifications',
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }