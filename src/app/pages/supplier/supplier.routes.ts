import { Routes } from '@angular/router';
import { roleGuard } from 'src/app/guards/role.guard';
import { CanvassingComponent } from '../enduser/canvassing/canvassing.component';
import { RequestedQuotationComponent } from './requested-quotation/requested-quotation.component';
import { InventoryComponent } from './inventory/inventory.component';

export const SupplierRoutes: Routes = [
  {
    path: '',
    children: [
    //   {
    //     path: 'canvassing',
    //     component: CanvassingComponent,
    //     data: { breadcrumb: 'Canvanssing', roles: ['supplier'] },
    //     canActivate: [roleGuard],
    // },
    {
      path: 'requested-quotations',
      component: RequestedQuotationComponent,
      data: { breadcrumb: 'Requested Quotations', roles: ['supplier'] },
      canActivate: [roleGuard],
    },
    {
      path: 'inventory',
      component: InventoryComponent,
      data: { breadcrumb: 'Inventory', roles: ['supplier'] },
      canActivate: [roleGuard],
    },
    ],
  },
];
