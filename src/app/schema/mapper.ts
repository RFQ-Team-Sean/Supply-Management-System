// Auto-generated mapper.ts
export const Relations = [
  ['PPMP', 'Office', 'office_id', 'one-to-many'],
  ['PPMPProject', 'ProcurementMode', 'procurement_mode_id', 'one-to-many'],
  ['PPMPProject', 'UserBudget', 'user_budget_id', 'one-to-many'],
  ['Budget', 'FundSource', 'fund_id', 'one-to-many'],
  ['Budget', 'Office', 'office_id', 'one-to-many'],
  ['UserBudget', 'Budget', 'budget_id', 'one-to-many'],
  ['UserBudget', 'Users', 'user_id', 'one-to-many'],
  ['PPMPItem', 'PPMPProject', 'ppmp_project_id', 'one-to-many'],
  ['Approvals', 'Approver', 'approver_id', 'one-to-many'],
  ['Approver', 'Users', 'user_id', 'one-to-many'],
  ['APP', 'FundSource', 'fund_source', 'one-to-many'],
  ['APP', 'Users', 'prepared_by', 'one-to-many'],
  ['PurchaseRequest', 'Office', 'office_id', 'one-to-many'],
  ['PurchaseRequest', 'PPMPProject', 'project_id', 'one-to-one'],
  ['PurchaseRequest', 'Users', 'user_id', 'one-to-many'],
  ['Office', 'Department', 'department_id', 'one-to-many'],
  ['Users', 'Office', 'officeId', 'one-to-many'],
  ['Contract', 'PurchaseRequest', 'purchase_request_id', 'one-to-many'],
  ['InspectionAcceptance', 'Contract', 'contract_id', 'one-to-many'],
  ['Payment', 'Contract', 'contract_id', 'one-to-many'],
  ['Invitation', 'ConferenceEvent', 'event_id', 'one-to-many'],
  ['Asset', 'Category', 'categoryId', 'one-to-many'],
  ['RepairHistory', 'Asset', 'assetId', 'one-to-many'],
  ['WarehouseProduct', 'Warehouse', 'warehouseId', 'one-to-many']
];
export const DateFields = ['date_submitted', 'date_approved', 'date_created', 'date_allocated', 'date', 'timestamp', 'date_prepared', 'date_approved', 'request_date', 'dateConstructed', 'contract_date', 'start_date', 'end_date', 'inspection_date', 'disbursement_voucher_date', 'payment_date', 'performed_at', 'created_at', 'upload_date', 'date', 'event_time', 'created_at', 'date', 'time', 'sent_at', 'purchaseDate', 'warrantyExpiry', 'date', 'date', 'dateAdded'];
