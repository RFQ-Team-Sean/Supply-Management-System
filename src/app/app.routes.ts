import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/services/auth-guard/auth.guard'; // Import the guard

import { AuthLayoutComponent } from './features/auth-layout/auth-layout.component';
import { UserLayoutComponent } from './features/user-layout/user-layout.component';
import { UDashboardComponent } from './features/user-layout/u-dashboard/u-dashboard.component';
import { AdminLayoutComponent } from './features/admin-layout/admin-layout.component';
import { ADashboardComponent } from './features/admin-layout/a-dashboard/a-dashboard.component';
import { UUsermanagement } from './features/user-layout/u-usermanagement/u-usermanagement.component';
import { UPurchasemanagement } from './features/user-layout/u-purchaserequest/u-purchaserequest.component';
import { USupplymanagement } from './features/user-layout/u-supplymanagement/u-supplymanagement.component';
import { UReports } from './features/user-layout/u-reports/u-reports.component';
import { ViewDetailsComponent } from './shared/components/view-details/view-details.component';
import { APerchaserequestComponent } from './features/admin-layout/a-purchaserequest/a-purchaserequest.component';
import { ASupplymanagement } from './features/admin-layout/a-supplymanagement/a-supplymanagement.component';
import { AInventorymanagement } from './features/admin-layout/a-inventorymanagement/a-inventorymanagement.component';
import { ANotification } from './features/admin-layout/a-notification/a-notification.component';
import { ASystemsettings } from './features/admin-layout/a-systemsettings/a-systemsettings.component';
import { UserManagementComponent } from './features/admin-layout/user-management/user-management.component';
import { AReportsComponent } from './features/admin-layout/a-reports/a-reports.component';
import { UserDetailComponent } from './features/admin-layout/user-management/user-detail/user-detail.component';
import { UInventorymanagement } from './features/user-layout/u-inventorymanagement/u-inventorymanagement.component';
import { CreateUserComponent } from './features/admin-layout/user-management/create-user/create-user.component';
import { UNotification } from './features/user-layout/u-notification/u-notificationcomponent';
import { USystemsetting } from './features/user-layout/u-systemsetting/u-systemsetting.component';
import { UProfileComponent } from './features/user-layout/u-profile/u-profile.component';
import { AProfileComponent } from './features/admin-layout/a-profile/a-profile.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [AuthGuard], // Protect user layout
    data: { role: 'user' }, // Only allow users with 'user' role
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UDashboardComponent },
      { path: 'u-usermagement', component: UUsermanagement },
      { path: 'u-purchasemanagement', component: UPurchasemanagement },
      { path: 'u-supplymanagement', component: USupplymanagement },
      { path: 'u-inventorymanagement', component: UInventorymanagement},
      { path: 'u-reports', component: UReports },
      { path: 'u-systemsetting', component: USystemsetting },
      { path: 'u-notification', component: UNotification },
      { path: 'view-details/:documentCode', component: ViewDetailsComponent }, // Updated route with parameter
      { path: 'u-profile', component: UProfileComponent },    
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Protect admin layout
    data: { role: 'admin' }, // Only allow users with 'admin' role
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ADashboardComponent },
      { path: 'a-purchaserequest', component: APerchaserequestComponent },
      { path: 'a-supplymanagement', component: ASupplymanagement },
      { path: 'a-inventorymanagement', component: AInventorymanagement },
      { path: 'a-systemsettings', component: ASystemsettings },
      { path: 'a-reports', component: AReportsComponent },
      { path: 'a-notification', component: ANotification },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'user-detail/:id', component: UserDetailComponent },
      { path: 'create-user', component: CreateUserComponent},
      { path: 'view-details/:documentCode', component: ViewDetailsComponent },
      { path: 'a-profile', component: AProfileComponent },    
    ],
  },
  {
    path: '**',
    redirectTo: '/login', // or a 404 page
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
