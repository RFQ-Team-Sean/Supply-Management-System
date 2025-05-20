import { Routes } from '@angular/router';
import { roleGuard } from 'src/app/guards/role.guard';
import { ValidateApprovedRequestComponent } from './validate-approved-request/validate-approved-request.component';
import { PreparePurchasedOrdersComponent } from './prepare-purchased-orders/prepare-purchased-orders.component';
import { ApprovedPurchaseRequestsComponent } from './approved-purchase-requests/approved-purchase-requests.component';
import { PurchaseOrderComponent } from '../shared/purchase-order/purchase-order.component';
import { PurchaseOrdersComponent } from './purchase-orders/purchase-orders.component';
import { BacDashboardComponent } from './bac-dashboard/bac-dashboard.component';
import { ConsolidationComponent } from './consolidation/consolidation.component';
import { ConferenceComponent } from './conference/conference.component';
import { InvitationToBidComponent } from './invitation-to-bid/invitation-to-bid.component';
import { OpeningOfBidsComponent } from './opening-of-bids/opening-of-bids.component';
import { AppSharedComponent } from '../shared/app-shared/app-shared.component';
import { PrSharedComponent } from '../shared/pr-shared/pr-shared.component';
import { PriceQuotationComponent } from '../shared/price-quotation/price-quotation.component';
import { ResolutionComponent } from './resolution/resolution.component';
import { AbstractQuotationComponent } from './abstract-quotation/abstract-quotation.component';

export const bacRoutes: Routes = [
  {
    path: 'bac-dashboard',
    component: BacDashboardComponent, // Single page for BAC functionality
    data: { breadcrumb: 'Dashboard', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'consolidation',
    component: ConsolidationComponent, // Single page for BAC functionality
    data: { breadcrumb: 'Consolidation', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'app-app-shared',
    component: AppSharedComponent, // Single page for BAC functionality
    data: { breadcrumb: 'Annual Procurement Plan', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'app-pr-shared',
    component: PrSharedComponent, // Single page for BAC functionality
    data: { breadcrumb: 'Annual Procurement Plan', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'validate-approved-request',
    component: ValidateApprovedRequestComponent, // Single page for BAC functionality
    data: { breadcrumb: 'Validate Approved Request', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'prepare-purchase-orders',
    component: PreparePurchasedOrdersComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Prepare Purchase Orders', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'purchase-orders',
    component: PurchaseOrdersComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Purchase Orders', roles: ['bac', 'superadmin'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },

   {
    path: 'conference',
    component: ConferenceComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Conference', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'invitation-to-bid',
    component: InvitationToBidComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Invitation to Bid', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
     
         {
    path: 'opening-of-bids',
    component: OpeningOfBidsComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Opening of Bids', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'price-quotation',
    component: PriceQuotationComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Price Quotation', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'resolution-to-award',
    component: ResolutionComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Resolution to Award', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
  {
    path: 'abstract-quotation',
    component: AbstractQuotationComponent, // Page for preparing purchase orders
    data: { breadcrumb: 'Abstract of Quotation', roles: ['bac'] }, // Only 'bac' and 'superadmin' can access
    canActivate: [roleGuard], // Protect the route with roleGuard
  },
];