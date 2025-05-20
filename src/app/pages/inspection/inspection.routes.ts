import { Routes } from '@angular/router';

import { InspectionDashboardComponent } from './inspection-dashboard/inspection-dashboard.component';
import { PurchaseRequestComponent } from './purchase-request/purchase-request.component';
import { ReceiptApprovalComponent } from './receipt-approval/receipt-approval.component';


export const InspectionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inspection-dashboard',
        component: InspectionDashboardComponent,
        data: {breadcrumb: 'Dashboard'}

      },
      {
        path: 'purchase-request',
        component: PurchaseRequestComponent,
        data: {breadcrumb: 'Purchase Requests'}

      },
      {
        path: 'receipt-approval',
        component: ReceiptApprovalComponent,
        data: {breadcrumb:'Receipt Approval'}
      },
    ],
  },
];