import { Routes } from '@angular/router';
import { UploadDeliveryReceiptComponent } from './upload-delivery-receipt/upload-delivery-receipt.component';
import { roleGuard } from 'src/app/guards/role.guard';
import { StockingComponent } from './stocking/stocking.component';
import { RsmiComponent } from './rsmi/rsmi.component';
import { IcsComponent } from './ics/ics.component';
import { ParComponent } from './par/par.component';
// import { CompileReportsComponent } from './compile-reports/compile-reports.component';
import { SupplyDashboardComponent } from './supply-dashboard/supply-dashboard.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { PriceQuotationComponent } from '../shared/price-quotation/price-quotation.component';
import { InventoryItemComponent } from '../shared/inventory-item/inventory-item.component';
import { ManageWarehouseComponent } from '../shared/manage-warehouse/manage-warehouse.component';
import { AssestPropertyComponent } from '../shared/assest-property/assest-property.component';
import { DeliveredStockComponent } from '../shared/delivered-stock/delivered-stock.component';

import { SuppliersComponent } from './suppliers/suppliers.component';
import { IarComponent } from './iar/iar.component';
import { RpciComponent } from './rpci/rpci.component';
import { RPCPPEComponent } from './rpcppe/rpcppe.component';
import { IIRUPComponent } from './iirup/iirup.component';
import { RLSDDPComponent } from './rlsddp/rlsddp.component';
import { PTRComponent } from './ptr/ptr.component';
import { ReturnsComponent } from './returns/returns.component';
import { SpecialReceivingComponent } from './special-receiving/special-receiving.component';
import { FixedAssetReceivingComponent } from './fixed-asset-receiving/fixed-asset-receiving.component';
import { SuppliesReceivingComponent } from './supplies-receiving/supplies-receiving.component';
import { SuppliesIssuanceComponent } from './supplies-issuance/supplies-issuance.component';

export const SupplyUnitRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/stocking',
        pathMatch: 'full',
      },
      {
        path: 'supply-dashboard',
        component: SupplyDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Dashboard'  } // specify roles here
      },
      {
        path: 'stocking',
        component: StockingComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin','enduser'], breadcrumb: 'Supplies'  } // specify roles here
      },
      {
        path: 'upload-delivery-receipt',
        component: UploadDeliveryReceiptComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Upload Delivery Receipt' } // specify roles here
      },
      {
        path: 'rsmi',
        component: RsmiComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate RSMI' } // specify roles here
      },
      {
        path: 'par',
        component: ParComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate PAR' } // specify roles here
      },
      {
        path: 'ics',
        component: IcsComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate ICS' } // specify roles here
      },
      {
        path: 'iar',
        component: IarComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate IAR' } // specify roles here
      },
      {
        path: 'rpci',
        component: RpciComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate RPCI' } // specify roles here
      },
      {
        path: 'rpcppe',
        component: RPCPPEComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate RPCPPE' } // specify roles here
      },
      {
        path: 'iirup',
        component: IIRUPComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate IIRUP' } // specify roles here
      },
      {
        path: 'rlsddp',
        component: RLSDDPComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate RLSDDP' } // specify roles here
      },
      {
        path: 'ptr',
        component: PTRComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate PTR' } // specify roles here
      },
      // {
      //   path: 'compile-reports',
      //   component: CompileReportsComponent,
      //   canActivate: [roleGuard],
      //   data: { roles: ['supply', 'superadmin'], breadcrumb: 'Generate ICS' } // specify roles here
      // },
       {
        path: 'delivery',
        component: DeliveryComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Delivery' } // specify roles here
      },
      {
        path: 'price-quotation',
        component: PriceQuotationComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply'], breadcrumb: 'Price Quotationn' } // specify roles here
      },
      {
        path: 'inventory-item',
        component: InventoryItemComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Inventory Item' } // specify roles here
      },
      {
        path: 'manage-warehouse',
        component: ManageWarehouseComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Manage Warehouse' } // specify roles here
      },
      {
        path: 'asset-property',
        component: AssestPropertyComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Asset & Property' } // specify roles here
      },
      {
        path: 'suppliers',
        component: SuppliersComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin', 'enduser'], breadcrumb: 'Supplier Directory' } // specify roles here
      },
      {
        path: 'returns',
        component: ReturnsComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Returns' }
      },
      {
        path: 'special-receiving',
        component: SpecialReceivingComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin', 'admin'], breadcrumb: 'Special Receiving' }
      },
      {
        path: 'fixed-asset-receiving',
        component: FixedAssetReceivingComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin', 'admin'], breadcrumb: 'Fixed Asset Receiving' }
      },
      {
        path: 'supplies-receiving',
        component: SuppliesReceivingComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin', 'admin'], breadcrumb: 'Supplies Receiving' }
      },
      {
        path: 'supplies-issuance',
        component: SuppliesIssuanceComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin', 'admin', 'end-user'], breadcrumb: 'Supplies Issuance' }
      },
      {
        path: 'delivered-stock',
        component: DeliveredStockComponent,
        canActivate: [roleGuard],
        data: { roles: ['supply', 'superadmin'], breadcrumb: 'Delivered Stock' } // specify roles here
      },
    ],
  },
];
