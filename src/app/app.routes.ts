import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/services/auth-guard/auth.guard';

// Auth Layout
import { AuthLayoutComponent } from './features/auth-layout/auth-layout.component';
import { LoginFormComponent } from './features/auth-layout/login-form/login-form.component';

// User Layout and Components
import { UserLayoutComponent } from './features/user-layout/user-layout.component';
import { UDashboardComponent } from './features/user-layout/u-dashboard/u-dashboard.component';
import { UUsermanagement } from './features/user-layout/u-usermanagement/u-usermanagement.component';
import { UPurchasemanagement } from './features/user-layout/u-purchaserequest/u-purchaserequest.component';
import { USupplymanagement } from './features/user-layout/u-supplymanagement/u-supplymanagement.component';
import { UInventorymanagement } from './features/user-layout/u-inventorymanagement/u-inventorymanagement.component';
import { UReports } from './features/user-layout/u-reports/u-reports.component';
import { USystemsetting } from './features/user-layout/u-systemsetting/u-systemsetting.component';
import { UNotification } from './features/user-layout/u-notification/u-notificationcomponent';
import { UProfileComponent } from './features/user-layout/u-profile/u-profile.component';

// Admin Layout and Components
import { AdminLayoutComponent } from './features/admin-layout/admin-layout.component';
import { ADashboardComponent } from './features/admin-layout/a-dashboard/a-dashboard.component';
import { APurchaserequestComponent } from './features/admin-layout/a-purchaserequest/a-purchaserequest.component';
import { ASupplymanagement } from './features/admin-layout/a-supplymanagement/a-supplymanagement.component';
import { AInventorymanagement } from './features/admin-layout/a-inventorymanagement/a-inventorymanagement.component';
import { ANotification } from './features/admin-layout/a-notification/a-notification.component';
import { UserManagementComponent } from './features/admin-layout/user-management/user-management.component';
import { AReportsComponent } from './features/admin-layout/a-reports/a-reports.component';
import { UserDetailComponent } from './features/admin-layout/user-management/user-detail/user-detail.component';
import { CreateUserComponent } from './features/admin-layout/user-management/create-user/create-user.component';
import { AProfileComponent } from './features/admin-layout/a-profile/a-profile.component';

// Shared Components
import { ViewDetailsComponent } from './shared/components/view-details/view-details.component';

export const routes: Routes = [
  // Default route - redirect to login
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  
  // Auth routes
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginFormComponent }
    ]
  },
  
  // GSO routes
  {
    path: 'gso',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'gso' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UDashboardComponent },
      { path: 'usermagement', component: UUsermanagement },
      { path: 'purchase-management', component: UPurchasemanagement },
      { path: 'supply-management', component: USupplymanagement },
      { path: 'inventory-management', component: UInventorymanagement },
      { path: 'reports', component: UReports },
      { path: 'system-setting', component: USystemsetting },
      { path: 'notification', component: UNotification },
      { path: 'view-details/:documentCode', component: ViewDetailsComponent },
      { path: 'profile', component: UProfileComponent },
    ],
  },
  
  // Department routes
  {
    path: 'department',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'department' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UDashboardComponent },
      { path: 'purchase-management', component: UPurchasemanagement },
      { path: 'inventory-management', component: UInventorymanagement },
      { path: 'notification', component: UNotification },
      { path: 'profile', component: UProfileComponent },
    ],
  },
  
  // Property Management routes
  {
    path: 'property',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'property_management' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UDashboardComponent },
      { path: 'inventory-management', component: UInventorymanagement },
      { path: 'reports', component: UReports },
      { path: 'notification', component: UNotification },
      { path: 'profile', component: UProfileComponent },
    ],
  },
  
  // BAC routes
  {
    path: 'bac',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'bac' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UDashboardComponent },
      { path: 'purchase-management', component: UPurchasemanagement },
      { path: 'notification', component: UNotification },
      { path: 'profile', component: UProfileComponent },
    ],
  },
  
  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ADashboardComponent },
      { path: 'purchase-request', component: APurchaserequestComponent },
      { path: 'supply-management', component: ASupplymanagement },
      { path: 'inventory-management', component: AInventorymanagement },
      { path: 'reports', component: AReportsComponent },
      { path: 'notification', component: ANotification },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'user-detail/:id', component: UserDetailComponent },
      { path: 'create-user', component: CreateUserComponent },
      { path: 'view-details/:documentCode', component: ViewDetailsComponent },
      { path: 'profile', component: AProfileComponent },
    ],
  },
  
  // Wildcard route - redirect to login
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}