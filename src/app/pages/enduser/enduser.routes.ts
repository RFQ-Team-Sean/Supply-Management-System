import { Routes } from '@angular/router';
import { roleGuard } from 'src/app/guards/role.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewPlanComponent } from './view-plan/view-plan.component';
import { RequisitionComponent } from './requisition/requisition.component';
import { ReceivingComponent } from './receiving/receiving.component';
import { CanvassingComponent } from './canvassing/canvassing.component';
import { SpecialReceivingComponent } from './special-receiving/special-receiving.component';
import { PpmpListComponent } from './ppmp-list/ppmp-list.component';
import { AnnualProcurementPlanComponent } from './annual-procurement-plan/annual-procurement-plan.component';
import { CompletionComponent } from './completion/completion.component';
import { PpmpComponent } from './ppmp/ppmp.component';
import { ObligationRequestComponent } from './obligation-request/obligation-request.component';
import { InventoryItemComponent } from '../shared/inventory-item/inventory-item.component';
import { DeliveredStockComponent } from '../shared/delivered-stock/delivered-stock.component';
import { SuppliersComponent } from '../supply-unit/suppliers/suppliers.component';
import { S } from '@angular/cdk/keycodes';
import { RequestItemComponent } from '../shared/request-item/request-item.component';

export const enduserRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { breadcrumb: 'Dashboard', roles: ['enduser'] }, // Use 'enduser' role
        canActivate: [roleGuard],
      },
      {
        path: 'obligation-request',
        component: ObligationRequestComponent,
        data: { breadcrumb: 'Obligation Request and Status', roles: ['enduser'] }, // Use 'enduser' role
        canActivate: [roleGuard],
      },
      {
        path: 'view-plan',
        component: ViewPlanComponent,
        data: { breadcrumb: 'View Plan', roles: ['enduser'] },
        canActivate: [roleGuard],
      },
    
      {
        path: 'requisition',
        component: RequisitionComponent,
        data: { breadcrumb: 'Requisition', roles: ['enduser'] },
        canActivate: [roleGuard],
      },

      
      {
        path: 'receiving',
        component: ReceivingComponent,
        data: { breadcrumb: 'Receiving', roles: ['enduser'] },
        canActivate: [roleGuard],
      },

      {
        path: 'special-receiving',
        component: SpecialReceivingComponent,
        data: { breadcrumb: 'Special Receiving', roles: ['enduser','supply'] },
        canActivate: [roleGuard],
      },

        {
        path: 'canvassing',
        component: CanvassingComponent,
        data: { breadcrumb: 'Canvassing', roles: ['enduser'] },
        canActivate: [roleGuard],
      },
      {
        path: 'ppmp-list',
        component: PpmpListComponent,
        data: { breadcrumb: 'PPMP List', roles: ['enduser','supply'] },
        canActivate: [roleGuard],
      },

      
       {
        path: 'ppmp',
        component: PpmpComponent,
        data: { breadcrumb: 'Project Procurement Management Plan', roles: ['enduser'] },
        canActivate: [roleGuard],
      },

        {
        path: 'app',
        component: AnnualProcurementPlanComponent,
        data: { breadcrumb: 'Annual Procurement Plan', roles: ['enduser'] },
        canActivate: [roleGuard],
      },
    
          {
        path: 'completion',
        component: CompletionComponent,
        data: { breadcrumb: 'Completion and Acceptance', roles: ['enduser'] },
        canActivate: [roleGuard],
      },
          
             {
        path: 'obligation-request',
        component: ObligationRequestComponent,
        data: { breadcrumb: 'Obligation Request and Status', roles: ['enduser'] },
        canActivate: [roleGuard],
      },
      {
        path: 'inventory-item',
        component: InventoryItemComponent,
        data: { breadcrumb: 'Inventory Item', roles: ['end-user'] },
        canActivate: [roleGuard],
      },
      {
        path: 'delivered-stock',
        component: DeliveredStockComponent,
        data: { breadcrumb: 'Delivered Stock', roles: ['end-user'] },
        canActivate: [roleGuard],
      },
      {
        path: 'suppliers',
        component: SuppliersComponent,
        data: { breadcrumb: 'Supplier', roles: ['end-user'] },
        canActivate: [roleGuard],
      },
      {
        path: 'request-item',
        component: RequestItemComponent,
        data: { breadcrumb: 'Request Item', roles: ['end-user'] },
        canActivate: [roleGuard],
      },
    ],
  },
];