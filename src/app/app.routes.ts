import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/services/auth-guard/auth.guard';

import { AuthLayoutComponent } from './features/auth-layout/auth-layout.component';

import { UserLayoutComponent } from './features/user-layout/user-layout.component';
import { UDashboardComponent } from './features/user-layout/u-dashboard/u-dashboard.component';
import { AdminLayoutComponent } from './features/admin-layout/admin-layout.component';
import { ADashboardComponent } from './features/admin-layout/a-dashboard/a-dashboard.component';
import { UPpmpmanagement } from './features/user-layout/u-ppmpmanagement/u-ppmpmanagement.component';
import { UPurchaserequestComponent } from './features/user-layout/u-purchaserequest/u-purchaserequest.component';
import { USupplymanagement } from './features/user-layout/u-supplymanagement/u-supplymanagement.component';
import { UReports } from './features/user-layout/u-reports/u-reports.component';
import { AActivitylogsComponent } from './features/admin-layout/user-management/a-activitylogs/a-activitylogs.component';
import { ANotification } from './features/admin-layout/a-notification/a-notification.component';
import { UserManagementComponent } from './features/admin-layout/user-management/user-management.component';
import { AReportsComponent } from './features/admin-layout/a-reports/a-reports.component';
import { UInventorymanagement } from './features/user-layout/u-inventorymanagement/u-inventorymanagement.component';
import { CreateUserComponent } from './features/admin-layout/user-management/create-user/create-user.component';
import { UNotification } from './features/user-layout/u-notification/u-notificationcomponent';
import { USystemsetting } from './features/user-layout/u-systemsetting/u-systemsetting.component';
import { UProfileComponent } from './features/user-layout/u-profile/u-profile.component';
import { AProfileComponent } from './features/admin-layout/a-profile/a-profile.component';

//GSO
import { GsoDashboardComponent } from './features/gso-layout/gso-dashboard/gso-dashboard.component';
import { GsoPurchaserequestComponent } from './features/gso-layout/gso-purchaserequest/gso-purchaserequest.component';
import { GsoInventorymanagementComponent } from './features/gso-layout/gso-inventorymanagement/gso-inventorymanagement.component';
import { GsoReportsComponent } from './features/gso-layout/gso-reports/gso-reports.component';
import { GsoNotificationsComponent } from './features/gso-layout/gso-notifications/gso-notifications.component';
import { GsoSystemsettingsComponent } from './features/gso-layout/gso-systemsettings/gso-systemsettings.component';
import { GsoNewitemComponent } from './features/gso-layout/gso-inventorymanagement/gso-newitem/gso-newitem.component';
import { GsoInventoryeditComponent } from './features/gso-layout/gso-inventorymanagement/gso-inventoryedit/gso-inventoryedit.component';
import { AReportsdetailsComponent } from './features/admin-layout/a-reports/a-reportsdetails/a-reportsdetails.component';
import { GsoSuppliermanagemnetComponent } from './features/gso-layout/gso-suppliermanagemnet/gso-suppliermanagemnet.component';
import { UCreateprmComponent } from './features/user-layout/u-purchaserequest/u-createprm/u-createprm.component';
import { DCreateppmpComponent } from './features/user-layout/u-ppmpmanagement/d-createppmp/d-createppmp.component';
import { DViewppmpprocurementComponent } from './features/user-layout/u-ppmpmanagement/d-viewppmpprocurement/d-viewppmpprocurement.component';
import { DUpdateppmpprocurementComponent } from './features/user-layout/u-ppmpmanagement/d-updateppmpprocurement/d-updateppmpprocurement.component';
import { GsoPpmpentryComponent } from './features/gso-layout/gso-ppmpentry/gso-ppmpentry.component';
import { GsoBiddingmanagementComponent } from './features/gso-layout/gso-biddingmanagement/gso-biddingmanagement.component';

//BAC
import { BacDashboardComponent } from './features/bac-layout/bac-dashboard/bac-dashboard.component';
import { BacLayoutComponent } from './features/bac-layout/bac-layout.component';
import { GsoLayoutComponent } from './features/gso-layout/gso-layout.component';
import { BacBidmanagementComponent } from './features/bac-layout/bac-bidmanagement/bac-bidmanagement.component';
import { BacBidevaluationComponent } from './features/bac-layout/bac-bidevaluation/bac-bidevaluation.component';
import { BacSuppliermanagementComponent } from './features/bac-layout/bac-suppliermanagement/bac-suppliermanagement.component';

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
      { path: 'u-ppmpmanagement', component: UPpmpmanagement },
      { path: 'u-ppmpmanagement/create', component: DCreateppmpComponent },
      { path: 'u-purchasemanagement', component: UPurchaserequestComponent },
      { path: 'u-supplymanagement', component: USupplymanagement },
      { path: 'u-inventorymanagement', component: UInventorymanagement},
      { path: 'u-reports', component: UReports },
      { path: 'u-systemsetting', component: USystemsetting },
      { path: 'u-notification', component: UNotification },
      { path: 'u-createprm', component: UCreateprmComponent },
      { path: 'u-profile', component: UProfileComponent },
      { path: 'd-viewppmprocurement/:id', component: DViewppmpprocurementComponent },
      { path: 'd-updateppmprocurement/:id', component: DUpdateppmpprocurementComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ADashboardComponent },
      { path: 'a-activitylogs', component: AActivitylogsComponent },
      { path: 'a-reports', component: AReportsComponent },
      { path: 'a-notification', component: ANotification },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'create-user', component: CreateUserComponent },
      { path: 'a-reportsdetails/:reportCode', component: AReportsdetailsComponent },
      { path: 'a-profile', component: AProfileComponent },
    ],
  },
  {
    path: 'gso',
    component: GsoLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'gso' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: GsoDashboardComponent },
      { path: 'gso-ppmpentry', component: GsoPpmpentryComponent },
      { path: 'gso-biddingmanagement', component: GsoBiddingmanagementComponent },
      { path: 'gso-purchaserequest', component: GsoPurchaserequestComponent },
      { path: 'gso-inventorymanagement', component: GsoInventorymanagementComponent },
      { path: 'gso-suppliermanagement', component: GsoSuppliermanagemnetComponent },
      { path: 'gso-reports', component: GsoReportsComponent },
      { path: 'gso-notifications', component: GsoNotificationsComponent },
      { path: 'gso-systemsettings', component: GsoSystemsettingsComponent },
      { path: 'gso-newitem', component: GsoNewitemComponent },
      { path: 'gso-inventoryvedit/:id', component: GsoInventoryeditComponent },
      { path: 'a-profile', component: AProfileComponent },
    ],
  },
  {
    path: 'bac',
    component: BacLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'bac' },
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: BacDashboardComponent },
        { path: 'bac-bidevaluation', component: BacBidevaluationComponent},
        { path: 'bac-bidmanagement', component: BacBidmanagementComponent },
        { path: 'bac-suppliermanagement', component: BacSuppliermanagementComponent },
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
