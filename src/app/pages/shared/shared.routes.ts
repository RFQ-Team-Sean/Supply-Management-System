import { Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { DisbursementVouchersComponent } from './disbursement-vouchers/disbursement-vouchers.component';
import { DeliveryReceiptsComponent } from './delivery-receipts/delivery-receipts.component';
import { DeliveredItemsComponent } from './delivered-items/delivered-items.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { RequestQuotationComponent } from './request-quotation/request-quotation.component';
import { PurchaseReqComponent } from './purchase-req/purchase-req.component';
import { DisbursementComponent } from './disbursement/disbursement.component';
import { StockCardComponent } from './stock-card/stock-card.component';
import { RisComponent } from './ris/ris.component';
import { SemiExpendableComponent } from './semi-expendable/semi-expendable.component';
import { AoqComponent } from './aoq/aoq.component';
import { BudgetUtilizationComponent } from './budget-utilization/budget-utilization.component';
import { RequestForQuotationListComponent } from './request-for-quotation-list/request-for-quotation-list.component';
import { RfqComponent } from './rfq/rfq.component';
import { BACResolutionComponent } from './bac-resolution/bac-resolution.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { NoaComponent } from './noa/noa.component';
import { NtpComponent } from './ntp/ntp.component';
import { EditableComponent } from './editable/editable.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { PpmpSequenceComponent } from './ppmp-sequence/ppmp-sequence.component';
import { AppSequenceComponent } from './app-sequence/app-sequence.component';
import { ProcurementProcessComponent } from './procurement-process/procurement-process.component';
import { PrSequenceComponent } from './pr-sequence/pr-sequence.component';
import { DocumentManagementComponent } from './document-management/document-management.component';
import { AuditTrailsComponent } from './audit-trails/audit-trails.component';
import { AppSharedComponent } from './app-shared/app-shared.component';
import { PrSharedComponent } from './pr-shared/pr-shared.component';
import { InventoryItemComponent } from './inventory-item/inventory-item.component';
import { ManageWarehouseComponent } from './manage-warehouse/manage-warehouse.component';
import { AssestPropertyComponent } from './assest-property/assest-property.component';
import { PpmpDocumentComponent } from './ppmp-docs/ppmp-docs.component';
import { DeliveredStockComponent } from './delivered-stock/delivered-stock.component';
import { RequestItemComponent } from './request-item/request-item.component';
import { RequisitionIssueSlipComponent } from './requisition-issue-slip/requisition-issue-slip.component';
import { Component } from '@angular/core';

export const SharedRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/inventory',
        pathMatch: 'full',
      },
      {
        path: 'inventory',
        component: AssetsComponent,
        data: {breadcrumb:'Inventory'}
      },
      {
        path: 'app-app-shared',
        component: AppSharedComponent,
        data: {breadcrumb:'Inventory'}
      },
      {
        path: 'app-pr-shared',
        component: PrSharedComponent,
        data: {breadcrumb:'Inventory'}
      },
      {
        path: 'delivered-items',
        component: DeliveredItemsComponent,
        data: {breadcrumb:'Delivered Items'}
      },
       {
        path: 'ppmp-docs',
        component: PpmpDocumentComponent,
        data: {breadcrumb:'PPMP Document'}
      },
      {
        path: 'disbursement-vouchers',
        component: DisbursementVouchersComponent,
        data: {breadcrumb:'Disbursement Vouchers'}
      },
      {
        path: 'delivery-receipts',
        component: DeliveryReceiptsComponent,
        data: {breadcrumb:'Delivery Receipts'}
      }, 
       {  //delete from here
        path: 'approvals',
        component: ApprovalsComponent,
        data: {breadcrumb:'Approvals'}
      },
      {
        path: 'request-quotation',
        component: RequestQuotationComponent,
        data: {breadcrumb:'Request Quotation'}
      },
      {
        path: 'purchase-req',
        component: PurchaseReqComponent,
        data: {breadcrumb:'Purchase Request'}
      },
      {
        path: 'disbursement',
        component: DisbursementComponent,
        data: {breadcrumb:'Disbursement Template'}
      },

      {
        path: 'editable',
        component: EditableComponent,
        data: {breadcrumb:'View'}
      },

      {
        path: 'stock-transfer',
        component: StockTransferComponent,
        data: {breadcrumb:'Stock Transfer'}
      },
      {
        path: 'stock-card',
        component: StockCardComponent,
        data: {breadcrumb:'Stock Card Template'}
      },
      {
        path: 'ris',
        component: RisComponent,
        data: {breadcrumb:'Requisition and Issue Slip Template'}
      },
      {
        path: 'semi-expendable',
        component: SemiExpendableComponent,
        data: {breadcrumb:'Report of Semi-Expendable Property Issued Template'}
      },
      {
        path: 'aoq',
        component: AoqComponent,
        data: {breadcrumb:'Abstract of Quotations Template'}
      },
      {
        path: 'budget-utilization',
        component: BudgetUtilizationComponent,
        data: {breadcrumb:'Budget Utilization Report Template'}
      },
      {
        path: 'rfq-list',
        component: RequestForQuotationListComponent,
        data: {breadcrumb:'Request for Quotations'}
      },
      {
        path: 'rfq',
        component: RfqComponent,
        data: {breadcrumb:'Request for Quotation Template'}
      },
      {
        path: 'bac-resolution',
        component: BACResolutionComponent,
        data: {breadcrumb:'BAC Resolution Template'}
      },
      {
        path: 'purchase-order',
        component: PurchaseOrderComponent,
        data: {breadcrumb:'Purchase Order Template'}
      },
      {
        path: 'noa',
        component: NoaComponent,
        data: {breadcrumb:'Notice of Award Template'}
      },
      {
        path: 'ntp',
        component: NtpComponent,
        data: {breadcrumb:'Notice to Proceed Template'}
      },

       {
        path: 'ppmp-sequence',
        component: PpmpSequenceComponent,
        data: {breadcrumb:'Project Procurement Management Plan Sequence'}
      },
       
        {
        path: 'app-sequence',
        component: AppSequenceComponent,
        data: {breadcrumb:'Annual Procurement Plan Sequence'}
      },
        
           {
        path: 'procurement-process',
        component: ProcurementProcessComponent,
        data: {breadcrumb:'Procurement Process'}
      },
           
              {
        path: 'pr-sequence',
        component: PrSequenceComponent,
        data: {breadcrumb:'Purchase Request Sequence'}
      },
              
                    
      {
        path: 'document-management',
        component: DocumentManagementComponent,
        data: {breadcrumb:'Document Management'}
      },
              
                    
        {
        path: 'audit-trails',
        component: AuditTrailsComponent,
        data: {breadcrumb:'Audit Trails'}
      },

      {
        path: 'inventory-item',
        component: InventoryItemComponent,
        data: {breadcrumb:'Inventory Item'}
      },
      {
        path: 'manage-warehouse',
        component: ManageWarehouseComponent,
        data: {breadcrumb:'Manage Warehouse'}
      },
      {
        path: 'asset-property',
        component: AssestPropertyComponent,
        data: {breadcrumb:'Asset & Property'}
      },
      {
        path: 'delivered-stock',
        component: DeliveredStockComponent,
        data: {breadcrumb:'Delivered Stock'}
      },
      {
        path: 'requisition-issue-slip/:id',
        component: RequisitionIssueSlipComponent,
        data: {breadcrumb:'Requisition and Issue Slip'}
      },
      {
        path: 'request-item',
        component: RequestItemComponent,
        data: {breadcrumb:'Request Item'}
      }
    ],
  },
];
