import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory/inventory.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { roleGuard } from 'src/app/guards/role.guard';
import { ProductTypeComponent } from './product-type/product-type.component';
import { DepartmentComponent } from './department/department.component';
import { ApprovalSequenceComponent } from './approval-sequence/approval-sequence.component';
import { PaymentTermsComponent } from './payment-terms/payment-terms.component';
import { ItemClassificationComponent } from './item-classification/item-classification.component';
import { EndUserListComponent } from './end-user-list/end-user-list.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PurchaseOrdersAdminComponent } from './purchase-orders-admin/purchase-orders-admin.component';
import { AccountSetupComponent } from './account-setup/account-setup.component';
import { InventoryItemComponent } from '../shared/inventory-item/inventory-item.component';
import { ManageWarehouseComponent } from '../shared/manage-warehouse/manage-warehouse.component';
import { AssestPropertyComponent } from '../shared/assest-property/assest-property.component';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { DeliveredStockComponent } from '../shared/delivered-stock/delivered-stock.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/department',
        pathMatch: 'full',
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Dashboard' } 
      },
      {
        path: 'department',
        component: DepartmentComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Department' } 
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Inventory' } 
      },
      {
        path: 'supplier-list',
        component: SupplierListComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Supplier List' } 
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'User Management' } 
        },
       {
        path: 'product-type',
        component: ProductTypeComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Product Type' } 
        },
         {
        path: 'approval-sequence',
        component: ApprovalSequenceComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Approval Sequence' } 
        },
         
         {
        path: 'payment-terms',
        component: PaymentTermsComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Payment Terms' } 
      },
         
          {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'inventory' } 
      },
          
             {
        path: 'item-classification',
        component: ItemClassificationComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'item-cl  assification' } 
      },
                    {
        path: 'end-user-list',
        component: EndUserListComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'end-user-list' } 
      },
                    
                                    {
        path: 'purchase-order-admin',
        component: PurchaseOrdersAdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Purchase Orders' } 
      },
                                    
                                                                   {
        path: 'account-setup',
        component: AccountSetupComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Account Setup' } 
      },
                                                                   {
        path: 'inventory-item',
        component: InventoryItemComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Inventory Item' } 
      },
                                                                  {
        path: 'manage-warehouse',
        component: ManageWarehouseComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Manage Warehouse' } 
      },
      {
        path: 'asset-property',
        component: AssestPropertyComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Asset & Property' } 
      },
      {
        path: 'inventory-management',
        component: InventoryManagementComponent,
        canActivate: [roleGuard],
        data: { 
          roles: ['admin', 'superadmin'], 
          breadcrumb: 'Inventory Management' 
        }
      },
      {
        path: 'delivered-stock',
        component: DeliveredStockComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'superadmin'], breadcrumb: 'Delivered Stock' } 
      },
    ],
  },
];
