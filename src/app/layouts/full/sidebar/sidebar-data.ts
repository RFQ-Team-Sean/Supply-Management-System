import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [ 
  // {
  //   navCap: 'Home',
  //   divider: true,
  //   requiredRoles: ['superadmin','enduser','inspection','accounting','supply'],
  // },

   {
    navCap: 'Admin',
    divider: true,
    requiredRoles: ['admin', 'superadmin'],
  },
  {
    displayName: 'User Management',
    iconName: 'solar:widget-add-line-duotone',
    route: '/admin/user-management',
    requiredRoles: ['admin', 'superadmin'],
  },

  // {
  //   displayName: 'Account Setup',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/account-setup',
  //   requiredRoles: ['admin', 'superadmin'],
  // },

  //  {
  //   displayName: 'Purchase Order',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/purchase-order-admin',
  //   requiredRoles: ['admin', 'superadmin'],
  // },

  {
    displayName: 'Department',
    iconName: 'solar:widget-add-line-duotone',
    route: '/admin/department',
    requiredRoles: ['admin', 'superadmin'],
  },
  // {
  //   displayName: 'Supplier List',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/supplier-list',
  //   requiredRoles: ['admin', 'superadmin'],
  // },
  // {
  //   displayName: 'Enduser List',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/enduser-list',
  //   requiredRoles: ['admin', 'superadmin'],
  // },
  {
    displayName: 'Product Type',
    iconName: 'solar:widget-add-line-duotone',
    route: '/admin/product-type',
    requiredRoles: ['admin', 'superadmin'],
  },
  // {
  //   displayName: 'Approval Sequence',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/approval-sequence',
  //   requiredRoles: ['admin', 'superadmin'],
  // },
  
  // {
  //   displayName: 'Inventory Count',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/inventory',
  //   requiredRoles: ['admin', 'superadmin'],
  // },
  // {
  //   displayName: 'Item Classification',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/admin/item-classification',
  //   requiredRoles: ['admin', 'superadmin'],
  // },
  
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/enduser/dashboard',
  //   requiredRoles: ['enduser'],
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/inspection/inspection-dashboard',
  //   requiredRoles: ['inspection'],
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:documents-broken',
  //   route: '/supply-management/supply-dashboard',
  //   requiredRoles: ['supply'],
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/accounting/accounting-dashboard',
  //   requiredRoles: ['accounting'],
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:checklist-minimalistic-line-duotone',
  //   route: '/bac/bac-dashboard',
  //   requiredRoles: ['bac'],
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/dashboard',
  // },
  // {
  //   displayName: 'Approvals',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/shared/approvals',
  //   requiredRoles: ['enduser' , 'bac', 'accounting','supply', 'caf', 'president', 'inspection'],

  // },


   {
    navCap: 'Enduser',
    divider: true,
    requiredRoles: ['enduser'],
  },
  {
    displayName: 'PPMP',
    iconName: 'solar:documents-broken',
    route: '/enduser/ppmp',
    requiredRoles: ['enduser'],
  },
  

  //  {
  //   displayName: 'Annual Procurement Plan',
  //   iconName: 'solar:documents-broken',
  //   route: '/enduser/app',
  //   requiredRoles: ['enduser'],
  // },

 

 


   {
    displayName: 'PPMP Sequence',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/ppmp-sequence',
    requiredRoles: ['superadmin'],
  },

  
   {
    displayName: 'APP Sequence',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/app-sequence',
    requiredRoles: ['superadmin'],
  },
  
  
   {
    displayName: 'Procurement Process',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/procurement-process', 
    requiredRoles: ['superadmin'],
  },

  
   {
    displayName: 'PR Sequence',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/pr-sequence',
    requiredRoles: ['superadmin'],
  },
  

   {
    displayName: 'Document Management',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/document-management',
    requiredRoles: ['superadmin'],
  },

   {
    displayName: 'Audit Trails',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/audit-trails',
    requiredRoles: ['superadmin'],
  },

  {
    displayName: 'Payment Terms',
    iconName: 'solar:widget-add-line-duotone',
    route: '/admin/payment-terms',
    requiredRoles: ['admin', 'superadmin'],
  },
  
 

  {
    navCap: 'Supplier',
    divider: true,
    requiredRoles: ['supplier'],
  },
  // {
  //   displayName: 'Canvassing',
  //   iconName: 'solar:documents-broken',
  //   route: '/shared/rfq-list',
  //   requiredRoles: ['supplier'],
  //  },
   {
    displayName: 'Requested Quotations',
    iconName: 'solar:documents-broken',
    route: '/supplier/requested-quotations',
    requiredRoles: ['supplier'],
   },
   {
    displayName: 'Inventory',
    iconName: 'solar:documents-broken',
    route: '/supplier/inventory',
    requiredRoles: ['supplier'],
   },

  //  {
  //    displayName: 'Delivery',
  //    iconName: 'solar:inbox-archive-outline',
  //    route: '/supply-management/stocking',
  //    requiredRoles: ['enduser'],
  //  },
  // {
  //   displayName: 'Approval Receiving',
  //   iconName: 'solar:documents-broken',
  //   route: '/enduser/receiving',
  //   requiredRoles: ['enduser'],
  // },
  // {
  //   displayName: 'Special Receiving',
  //   iconName: 'solar:documents-broken',
  //   route: '/enduser/special-receiving',
  //   requiredRoles: ['enduser','supply'],
  // },


  // Inspection Section
  {
    navCap: 'Inspection',
    divider: true,
    requiredRoles: ['inspection'],
  },
  {
    displayName: 'Purchase Requests',
    iconName: 'solar:documents-broken',
    route: '/shared/app-pr-shared',
    requiredRoles: ['inspection', 'enduser'],
  },
  {
    displayName: 'Receipt Approval',
    iconName: 'solar:documents-broken',
    route: '/inspection/receipt-approval',
    requiredRoles: ['inspection'],
  },

  // Supply Unit Section
  {
    navCap: 'Supply Unit',
    divider: true,
    requiredRoles: ['supply', 'superadmin',],
  },
  
  {
    displayName: 'Delivery Receipts',
    iconName: 'solar:documents-broken',
    route: '/shared/delivery-receipts',
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'Supply Stocking',
    iconName: 'solar:inbox-archive-outline',
    route: '/supply-management/stocking',
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'Special Receiving',
    iconName: 'solar:inbox-archive-outline',
    route: '/supply-management/special-receiving',
    requiredRoles: ['supply', 'superadmin', 'admin'],
  },
  //{
  //  displayName: 'Delivery',
  //  iconName: 'solar:inbox-archive-outline',
  //  route: '/supply-management/delivery',
  //  requiredRoles: ['supply'],
  //},
  //{
  //  displayName: 'Stock Transfer',
  //  iconName: 'solar:documents-broken',
  //  route: '/shared/stock-transfer',
  //  requiredRoles: ['supply', 'superadmin'],
  //},
  // {
  //   displayName: 'Stock Transfer',
  //   iconName: 'solar:documents-broken',
  //   route: '/shared/stock-transfer',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  { 
    displayName: 'Delivery Tracking',
    iconName: 'fluent:check-24-regular',
    route: '/shared/delivered-stock',
    requiredRoles: ['supply', 'enduser'],
  },
  { 
    displayName: 'Request Item',
    iconName: 'solar:documents-broken',
    route: '/shared/request-item',
    requiredRoles: ['supply', 'enduser'],
  },
  // {F
  //   iconName: 'solar:inbox-archive-outline',
  //   route: '/supply-management/delivery',
  //   requiredRoles: ['supply'],
  // },

  //{
  //   displayName: 'Delivered Items',
  //   iconName: 'fluent:check-24-regular',
  //    route: '/shared/delivered-items',
  //    requiredRoles: ['supply'],
  // },
  {
    displayName: 'Suppliers Directory',
    iconName: 'solar:documents-broken',
    route: '/supply-management/suppliers',
    requiredRoles: ['supply', 'superadmin', 'enduser'],
  },
  // {
  //   displayName: 'Compile Reports',
  //   iconName: 'solar:ticket-sale-broken',
  //   route: '/supply-management/compile-reports',
  //   requiredRoles: ['supply'],
  // },
  
   {
    navCap: 'Budget',
    divider: true,
    requiredRoles: ['accounting'],
  },

  {
    displayName: 'Fund Source',
    iconName: 'solar:widget-add-line-duotone',
    route: '/accounting/funding-source',
    requiredRoles: ['accounting'],
  },
 

  {
    displayName: 'Budget Allocation',
    iconName: 'solar:widget-add-line-duotone',
    route: '/accounting/budget',
    requiredRoles: ['accounting'],
  },
  {
    displayName: 'Purchase Request',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/shared/app-pr-shared',
    requiredRoles: ['accounting'],
  },

    {
    displayName: 'Annual Procurement Plan',
    iconName: 'solar:widget-add-line-duotone',
    route: '/accounting/app-approval',
    requiredRoles: ['accounting'],
  },
  // { 
  //   displayName: 'ORS Management',
  //   iconName: 'solar:documents-broken',
  //   route: '/accounting/ors',
  //   requiredRoles: ['accounting', 'enduser'],
  // },
  {
    displayName: 'CA Certificates',
    iconName: 'solar:documents-broken',
    route: '/enduser/completion',
    requiredRoles: ['enduser'],
  },

   { 
    displayName: 'Obligation Request',
    iconName: 'solar:documents-broken',
    route: '/enduser/obligation-request',
    requiredRoles: [ 'enduser'],
  },
  {
    navCap: 'Accounting',
    divider: true,
    requiredRoles: ['accounting'],
  },
  {
    displayName: 'Disbursement Vouchers',
    iconName: 'solar:ticket-sale-broken',
    route: '/shared/disbursement-vouchers',
    requiredRoles: ['accounting'],
  },

  
  // {
  //   displayName: 'Classification',
  //   iconName: 'solar:ticket-sale-broken',
  //   route: '/accounting/classification',
  //   requiredRoles: [ 'accounting'],
  // },
  // {
  //   displayName: 'Voucher Review',
  //   iconName: 'solar:ticket-sale-broken',
  //   route: '/accounting/voucher-review',
  //   requiredRoles: [ 'accounting'],
  // },
  {
    displayName: 'Journal Entry Voucher',
    iconName: 'solar:ticket-sale-broken',
    route: '/accounting/journal-entry-voucher',
    requiredRoles: [ 'accounting'],
  },
  

  {
    displayName: 'General Ledger',
    iconName: 'solar:ticket-sale-broken',
    route: '/accounting/general-ledger',
    requiredRoles: [ 'accounting'],
  },
  {
    displayName: 'General Journal',
    iconName: 'solar:ticket-sale-broken',
    route: '/accounting/general-journal',
    requiredRoles: [ 'accounting'],
  },

  // {
  //   displayName: 'Purchase Request Approval',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/accounting/pr-approval',
  //   requiredRoles: ['accounting'],
  // },

  //  {
  //   displayName: 'Issue Slip',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/accounting/issue-slip',
  //   requiredRoles: ['accounting'],
  // },
   

  // {
  //   displayName: 'Budget Utilization Report',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/shared/rfq-list',
  //   requiredRoles: ['accounting'],
  // },


  // {
  //   displayName: 'Final Verification',
  //   iconName: 'solar:ticket-sale-broken',
  //   route: '/accounting/final-verification',
  //   requiredRoles: [ 'accounting'],
  // },

  // Admin Section
 

  // Views Section
  

  // BAC Section
  {
    navCap: 'BAC',
    divider: true,
    requiredRoles: ['bac'],
  },

  {
    displayName: 'Request for Quotation',
    iconName: 'solar:widget-add-line-duotone',
    route: '/shared/rfq-list',
    requiredRoles: ['bac'],
  },

  {
    displayName: 'Consolidation',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/consolidation',
    requiredRoles: ['bac'],
  },

   {
    displayName: 'Annual Procurement Plan',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/shared/app-app-shared',
    requiredRoles: ['bac'],
  },
  {
    displayName: 'Purchase Request',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/shared/app-pr-shared',
    requiredRoles: ['bac'],
  },
  {
    displayName: 'Conference',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/conference',
    requiredRoles: ['bac'],
  },
  {
    displayName: 'Invitation to Bid',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/invitation-to-bid',
    requiredRoles: ['bac'],
  },
  {
    displayName: 'Opening of Bids',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/opening-of-bids',
    requiredRoles: ['bac'],
  },
  {
    displayName: 'Contract',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/purchase-orders',
      requiredRoles: ['bac'],
  },
  {
    displayName: 'Price Quotation',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/price-quotation',
      requiredRoles: ['bac'],
  },
  {
    displayName: 'Resolution to Award',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/resolution-to-award',
      requiredRoles: ['bac'],
  },
  {
    displayName: 'Abstract of Quotation',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/bac/abstract-quotation',
      requiredRoles: ['bac'],
  },
  


  // {
  //   displayName: 'Validate Approved Request',
  //   iconName: 'solar:checklist-minimalistic-line-duotone',
  //   route: '/bac/validate-approved-request',
  //   requiredRoles: ['bac'],
  // },
  //  {
  //   displayName: 'Approved Purchase Request',
  //   iconName: 'solar:checklist-minimalistic-line-duotone',
  //   route: '/bac/approved-purchase-requests',
  //   requiredRoles: ['bac'],
  // },
  // {
  //   displayName: 'Abstract of Quotations Template',
  //   iconName: 'solar:checklist-minimalistic-line-duotone',
  //   route: '/shared/aoq',
  //   requiredRoles: ['bac'],
  // },
  
  // {
  //   displayName: 'Prepare Purchase Orders',
  //   iconName: 'solar:document-add-line-duotone',
  //   route: '/bac/prepare-purchase-orders',
  //   requiredRoles: ['bac'],
  // },
  //  {
  //   navCap: 'President',
  //   divider: true,
  //   requiredRoles: ['president'],
  // },
  //   {
  //   displayName: 'Approvals',
  //   iconName: 'solar:widget-add-line-duotone',
  //   route: '/shared/approvals',
  // },

  // {
  //   navCap: 'Receiving Management',
  //   divider: true,
  //   requiredRoles: ['supply', 'superadmin', 'admin'],
  // },
  
  // {
  //   displayName: 'Fixed Asset Receiving',
  //   iconName: 'solar:box-minimalistic-line-duotone',
  //   route: '/supply-management/fixed-asset-receiving',
  //   requiredRoles: ['supply', 'superadmin', 'admin'],
  // },
  // {
  //   displayName: 'Supplies Receiving',
  //   iconName: 'solar:box-minimalistic-line-duotone',
  //   route: '/supply-management/supplies-receiving',
  //   requiredRoles: ['supply', 'superadmin', 'admin'],
  // },
  // {
  //   displayName: 'Supplies Issuance',
  //   iconName: 'solar:box-minimalistic-line-duotone',
  //   route: '/supply-management/supplies-issuance',
  //   requiredRoles: ['supply', 'superadmin', 'admin', 'end-user'],
  // },

  {
    navCap: 'Inventory Management',
    divider: true,
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'Inventory Items',
    iconName: 'solar:bedside-table-3-broken',
    route: '/shared/inventory-item',
    requiredRoles: ['supply','superadmin', 'enduser'],
  },
  {
    displayName: 'Manage Warehouse',
    iconName: 'solar:archive-line-duotone',
    route: '/shared/manage-warehouse',
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'Asset & Property',
    iconName: 'solar:clipboard-list-broken',
    route: '/shared/asset-property',
    requiredRoles: ['supply', 'superadmin'],
  },
  // {
  //   displayName: 'Returns',
  //   iconName: 'solar:box-minimalistic-line-duotone',
  //   route: '/supply-management/returns',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  
    
     {
    navCap: 'Reports Generation',
    divider: true,
    requiredRoles: ['supply', 'superadmin'],
  },
  // {
  //   displayName: 'RSMI',
  //   iconName: 'solar:documents-broken',
  //   route: '/supply-management/rsmi',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  {
    displayName: 'PAR',
    iconName: 'solar:documents-broken',
    route: '/supply-management/par',
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'ICS',
    iconName: 'solar:documents-broken',
    route: '/supply-management/ics',
    requiredRoles: ['supply', 'superadmin'],
  },
  // {
  //   displayName: 'IAR',
  //   iconName: 'solar:documents-broken',
  //   route: '/supply-management/iar',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  {
    displayName: 'RPCI',
    iconName: 'solar:documents-broken',
    route: '/supply-management/rpci',
    requiredRoles: ['supply', 'superadmin'],
  },
  {
    displayName: 'RPCPPE',
    iconName: 'solar:documents-broken',
    route: '/supply-management/rpcppe',
    requiredRoles: ['supply', 'superadmin'],
  },
  // {
  //   displayName: 'IIRUP',
  //   iconName: 'solar:documents-broken',
  //   route: '/supply-management/iirup',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  {
    displayName: 'RLSDDP',
    iconName: 'solar:documents-broken',
    route: '/supply-management/rlsddp',
    requiredRoles: ['supply', 'superadmin'],
  },
  // {
  //   displayName: 'PTR',
  //   iconName: 'solar:documents-broken',
  //   route: '/supply-management/ptr',
  //   requiredRoles: ['supply', 'superadmin'],
  // },
  {
    displayName: 'Compile Reports',
    iconName: 'solar:documents-broken',
    route: '/supply-management/compile-reports',
    requiredRoles: ['supply', 'superadmin'],
  },


  // {
  //   displayName: 'Inventory',
  //   iconName: 'solar:box-broken',
  //   route: '/shared/inventory',
  //   requiredRoles: ['supply', 'bac', 'president', 'enduser', 'inspection'],
  // },
 
];

  // UI Components Section (No specific roles required)
  // {
  //   navCap: 'Ui Components',
  //   divider: true,
  // },
  // {
  //   displayName: 'Badge',
  //   iconName: 'solar:archive-minimalistic-line-duotone',
  //   route: '/ui-components/badge',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'solar:danger-circle-line-duotone',
  //   route: '/ui-components/chips',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'solar:bookmark-square-minimalistic-line-duotone',
  //   route: '/ui-components/lists',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'solar:text-field-focus-line-duotone',
  //   route: '/ui-components/tooltips',
  // },
  // {
  //   displayName: 'Forms',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/ui-components/forms',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'solar:tablet-line-duotone',
  //   route: '/ui-components/tables',
  // },

  // Auth Section (No specific roles required)
  // {
  //   navCap: 'Auth',
  //   divider: true,
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'solar:login-3-line-duotone',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'solar:user-plus-rounded-line-duotone',
  //   route: '/authentication/register',
  // },

  // Extra Section (No specific roles required)
  // {
  //   navCap: 'Extra',
  //   divider: true,
  // },
  // {
  //   displayName: 'Icons',
  //   iconName: 'solar:sticker-smile-circle-2-line-duotone',
  //   route: '/extra/icons',
  // },
  // {
  //   displayName: 'Sample Page',
  //   iconName: 'solar:planet-3-line-duotone',
  //   route: '/extra/sample-page',
  // },

