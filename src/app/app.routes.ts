import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/services/auth-guard/auth.guard';

import { AuthLayoutComponent } from './features/auth-layout/auth-layout.component';

import { UserLayoutComponent } from './features/user-layout/user-layout.component';
import { UDashboardComponent } from './features/user-layout/u-dashboard/u-dashboard.component';
import { AdminLayoutComponent } from './features/admin-layout/admin-layout.component';
import { ADashboardComponent } from './features/admin-layout/a-dashboard/a-dashboard.component';
import { UPpmpmanagement } from './features/user-layout/u-ppmpmanagement/u-ppmpmanagement.component';
import { UPurchasemanagement } from './features/user-layout/u-purchaserequest/u-purchaserequest.component';
import { USupplymanagement } from './features/user-layout/u-supplymanagement/u-supplymanagement.component';
import { UReports } from './features/user-layout/u-reports/u-reports.component';
import { ViewDetailsComponent } from './shared/components/view-details/view-details.component';
import { AActivitylogsComponent } from './features/admin-layout/a-activitylogs/a-activitylogs.component';
import { ANotification } from './features/admin-layout/a-notification/a-notification.component';
import { UserManagementComponent } from './features/admin-layout/user-management/user-management.component';
import { AReportsComponent } from './features/admin-layout/a-reports/a-reports.component';
import { UserDetailComponent } from './features/admin-layout/user-management/user-detail/user-detail.component';
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
import { GsoSuppliermanagementComponent } from './features/gso-layout/gso-suppliermanagement/gso-suppliermanagement.component';
import { GsoAssetmanagementlandComponent } from './features/gso-layout/gso-assetmanagementland/gso-assetmanagementland.component';
import { GsoAssetmanagementbuildingComponent } from './features/gso-layout/gso-assetmanagementbuilding/gso-assetmanagementbuilding.component';
import { GsoAssetmanagementmachineryComponent } from './features/gso-layout/gso-assetmanagementmachinery/gso-assetmanagementmachinery.component';
import { GsoAssetmanagementequipmentComponent } from './features/gso-layout/gso-assetmanagementequipment/gso-assetmanagementequipment.component';
import { GsoAssetmanagementvechilesComponent } from './features/gso-layout/gso-assetmanagementvechiles/gso-assetmanagementvechiles.component';
import { GsoNewrequestComponent } from './features/gso-layout/gso-purchaserequest/gso-newrequest/gso-newrequest.component';
import { GsoNewitemComponent } from './features/gso-layout/gso-inventorymanagement/gso-newitem/gso-newitem.component';
import { GsoNewassetlandComponent } from './features/gso-layout/gso-assetmanagementland/gso-newassetland/gso-newassetland.component';
import { GsoNewassetbuildingComponent } from './features/gso-layout/gso-assetmanagementbuilding/gso-newassetbuilding/gso-newassetbuilding.component';
import { GsoNewassetmachineryComponent } from './features/gso-layout/gso-assetmanagementmachinery/gso-newassetmachinery/gso-newassetmachinery.component';
import { GsoNewassetequipmentComponent } from './features/gso-layout/gso-assetmanagementequipment/gso-newassetequipment/gso-newassetequipment.component';
import { GsoNewassetvihiclesComponent } from './features/gso-layout/gso-assetmanagementvehicles/gso-newassetvihicles/gso-newassetvihicles.component';
import { GsoViewdetailsComponent } from './features/gso-layout/gso-purchaserequest/gso-viewdetails/gso-viewdetails.component';
import { GsoInventoryeditComponent } from './features/gso-layout/gso-inventorymanagement/gso-inventoryedit/gso-inventoryedit.component';
import { GsoSuppliereditComponent } from './features/gso-layout/gso-suppliermanagement/gso-supplieredit/gso-supplieredit.component';
import { GsoAssetlandeditComponent } from './features/gso-layout/gso-assetmanagementland/gso-assetlandedit/gso-assetlandedit.component';
import { GsoAssetlandviewComponent } from './features/gso-layout/gso-assetmanagementland/gso-assetlandview/gso-assetlandview.component';
import { AReportsdetailsComponent } from './features/admin-layout/a-reports/a-reportsdetails/a-reportsdetails.component';


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
      { path: 'u-purchasemanagement', component: UPurchasemanagement },
      { path: 'u-supplymanagement', component: USupplymanagement },
      { path: 'u-inventorymanagement', component: UInventorymanagement},
      { path: 'u-reports', component: UReports },
      { path: 'u-systemsetting', component: USystemsetting },
      { path: 'u-notification', component: UNotification },
      { path: 'view-details/:documentCode', component: ViewDetailsComponent }, 
      { path: 'u-profile', component: UProfileComponent },    
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
      { path: 'user-detail/:id', component: UserDetailComponent },    
      { path: 'create-user', component: CreateUserComponent },
      { path: 'a-reportsdetails/:reportCode', component: AReportsdetailsComponent },
      { path: 'a-profile', component: AProfileComponent },    
    ],
  },
  {
    path: 'gso',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'gso' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: GsoDashboardComponent },
      { path: 'gso-purchaserequest', component: GsoPurchaserequestComponent },
      { path: 'gso-inventorymanagement', component: GsoInventorymanagementComponent },
      { path: 'gso-reports', component: GsoReportsComponent },
      { path: 'gso-notifications', component: GsoNotificationsComponent },
      { path: 'gso-systemsettings', component: GsoSystemsettingsComponent },
      { path: 'gso-suppliermanagement', component: GsoSuppliermanagementComponent },
      { path: 'gso-assetmanagementland', component: GsoAssetmanagementlandComponent },
      { path: 'gso-assetmanagementbuilding', component: GsoAssetmanagementbuildingComponent },
      { path: 'gso-assetmanagementmachinery', component: GsoAssetmanagementmachineryComponent },
      { path: 'gso-assetmanagementlandequipment', component: GsoAssetmanagementequipmentComponent },
      { path: 'gso-assetmanagementlandvehicles', component: GsoAssetmanagementvechilesComponent },
      { path: 'gso-newrequest', component: GsoNewrequestComponent },
      { path: 'gso-newitem', component: GsoNewitemComponent },
      { path: 'gso-newassetland', component: GsoNewassetlandComponent },
      { path: 'gso-newassetbuilding', component: GsoNewassetbuildingComponent },
      { path: 'gso-newassetmachinery', component: GsoNewassetmachineryComponent },
      { path: 'gso-newassetequipment', component: GsoNewassetequipmentComponent },
      { path: 'gso-newassetvihicles', component: GsoNewassetvihiclesComponent },
      { path: 'gso-viewdetails/:documentCode', component: GsoViewdetailsComponent },
      { path: 'gso-inventoryvedit/:id', component: GsoInventoryeditComponent },
      { path: 'gso-supplieredit/:id', component: GsoSuppliereditComponent },
      { path: 'gso-assetlandedit/:id', component: GsoAssetlandeditComponent },

      { path: 'gso-assetlandview/:id', component: GsoAssetlandviewComponent },
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
