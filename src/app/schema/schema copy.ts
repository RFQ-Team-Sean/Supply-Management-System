// src/app/schema/schema.ts

import 'reflect-metadata'

function TableName(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata('table', tableName, target);
  };
}

export type ProcurementMethod = 'Public' | 'Alternative';

export type BudgetType = 'MOOE' | 'CO';

export type ProjectStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type ApprovalStatus = 'Approved' | 'Rejected';

export type EntityType = 'PPMP' | 'PurchaseRequest' | 'APP' | 'ProcurementProcess' | 'Contract' | 'InspectionAcceptance' | 'Payment';

export type RequestStatus = 'Draft' | 'Pending' | 'Approved';

export type UserType = 'SuperAdmin' | 'Admin' | 'User' | 'Head';

export type UserRole = 'superadmin' | 'accounting' | 'supply' | 'bac' | 'inspection' | 'enduser' | 'president';

export type ContractStatus = 'Active' | 'Completed' | 'Terminated';

export type PaymentMethod = 'Check' | 'ADA';

export type AuditAction = 'Created' | 'Updated' | 'Approved' | 'Rejected' | 'Deleted';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type EventMode = 'Online' | 'InPerson' | 'Hybrid';

export type EventType = 'PreProcurement' | 'PreBidding';

@TableName('PPMP')
export class PPMP {
  id: string
  fiscal_year: number
  status: ProjectStatus
  head_signature?: string
  user_signature?: string
  prepared_by_id: string
  office_id: string
  approved_by_id?: string
  date_submitted?: Date
  date_approved?: Date
  remarks?: string
  PPMPProjects?: PPMPProject[]
  Office?: Office
  PreparedBy?: Users
  ApprovedBy?: Users
}

@TableName('PPMPProject')
export class PPMPProject {
  id: string
  ppmp_id: string
  procurement_mode_id: string
  project_title: string
  project_code?: string
  project_description: string
  classifications: string[]
  user_budget_id: string
  abc?: number
  contract_scope?: string
  app_id?: string
  status: ProjectStatus
  PPMP?: PPMP
  PPMPItem?: PPMPItem[]
  ProcurementMode?: ProcurementMode
  UserBudget?: UserBudget
  PurchaseRequest?: PurchaseRequest
  ConferenceEvent?: ConferenceEvent[]
  PPMPSchedule?: PPMPSchedule[]
}

@TableName('ProcurementProcess')
export class ProcurementProcess {
  id: string
  name: string
  process_order: number
  procurement_mode_id: ProcurementMethod
}

@TableName('ProcurementMode')
export class ProcurementMode {
  id: string
  mode_name: string
  method: ProcurementMethod
  PPMPProject?: PPMPProject[]
}

@TableName('FundSource')
export class FundSource {
  id: string
  source_name: string
  APP?: APP[]
  Budget?: Budget[]
}

@TableName('Budget')
export class Budget {
  id: string
  office_id: string
  fund_id: string
  created_by: string
  fiscal_year: number
  budget_name: string
  allocated_budget: number
  used_amount: number
  date_created: Date
  budget_type: BudgetType
  FundSource?: FundSource
  Office?: Office
  UserBudget?: UserBudget[]
}

@TableName('UserBudget')
export class UserBudget {
  id: string
  user_id: string
  budget_id: string
  allocated_amount: number
  used_amount: number
  date_allocated: Date
  PPMPProject?: PPMPProject[]
  Budget?: Budget
  Users?: Users
}

@TableName('PPMPItem')
export class PPMPItem {
  id: string
  ppmp_project_id: string
  quantity_required: number
  unit_of_measurement: string
  estimated_unit_cost: number
  estimated_total_cost: number
  classification: string
  technical_specification?: string
  scope_of_work?: string
  terms_of_reference?: string
  PPMPProject?: PPMPProject
}

@TableName('PPMPSchedule')
export class PPMPSchedule {
  id: string
  ppmp_id: string
  milestone: string
  date: Date
  PPMPProject?: PPMPProject[]
}

@TableName('Approvals')
export class Approvals {
  id: string
  approver_id: string
  entity_id: string
  approval_status: ApprovalStatus
  remarks?: string
  signature?: string
  timestamp: Date
  document_id: string
  Approver?: Approver
}

@TableName('Approver')
export class Approver {
  id: string
  user_id: string
  entity_id: string
  name: string
  approval_order: number
  process_id?: string
  Approvals?: Approvals[]
  Users?: Users
}

@TableName('Entity')
export class Entity {
  id: number
  name: EntityType
  description?: string
}

@TableName('APP')
export class APP {
  id: string
  fund_source: string
  prepared_by: string
  approvals_id: string
  fiscal_year: number
  date_prepared: Date
  date_approved?: Date
  total_quantity_required: number
  total_estimated_cost: number
  FundSource?: FundSource
  Users?: Users
}

@TableName('PurchaseRequest')
export class PurchaseRequest {
  id: string
  prNo: string
  user_id: string
  office_id: string
  project_id: string
  current_approver_level: number
  current_procurement_level?: number
  request_date: Date
  status: RequestStatus
  signature?: string
  Contract?: Contract[]
  Office?: Office
  PPMPProject?: PPMPProject
  Users?: Users
}

@TableName('VendorInfo')
export class VendorInfo {
  id: string
  companyName: string
  tin: string
  address: string
  telFax: string
  email: string
}

@TableName('Department')
export class Department {
  id: string
  name: string
  Office?: Office[]
}

@TableName('Building')
export class Building {
  id: string
  name: string
  address: string
  numberOfFloors: number
  dateConstructed?: Date
  Office?: Office[]
}

@TableName('Office')
export class Office {
  id: string
  department_id: string
  building_id?: string
  name: string
  Budget?: Budget[]
  Building?: Building
  Department?: Department
  PPMP?: PPMP[]
  PurchaseRequest?: PurchaseRequest[]
  Users?: Users[]
}

@TableName('Users')
export class Users {
  id: string
  fullname: string
  username: string
  password: string
  position?: string
  user_type: UserType
  role: UserRole
  isAdmin?: boolean
  profile: string
  officeId: string
  APP?: APP[]
  Approver?: Approver[]
  PPMPPrepared?: PPMP[]
  PPMPApproved?: PPMP[]
  PurchaseRequest?: PurchaseRequest[]
  UserBudget?: UserBudget[]
  office?: Office
}

@TableName('Contract')
export class Contract {
  id: string
  purchase_request_id: string
  contractor_name: string
  contract_amount: number
  contract_date: Date
  start_date: Date
  end_date: Date
  attachment?: string
  status: ContractStatus
  PurchaseRequest?: PurchaseRequest
  InspectionAcceptance?: InspectionAcceptance[]
  Payment?: Payment[]
}

@TableName('InspectionAcceptance')
export class InspectionAcceptance {
  id: string
  contract_id: string
  inspected_by: number
  inspection_date: Date
  signature: string
  remarks?: string
  Contract?: Contract
}

@TableName('Payment')
export class Payment {
  id: string
  contract_id: string
  disbursement_voucher_date: Date
  payment_date: Date
  amount_paid: number
  payment_method: PaymentMethod
  Contract?: Contract
}

@TableName('AuditTrail')
export class AuditTrail {
  id: string
  entity_id: string
  record_id: string
  approvals_id: string
  action: AuditAction
  performed_by: string
  performed_at: Date
  remarks?: string
}

@TableName('Notification')
export class Notification {
  id: number
  message: string
  type: NotificationType
  created_at: Date
  is_read: boolean
  office_id?: string
  user_id?: string
  role?: UserRole
}

@TableName('Document')
export class Document {
  id: string
  procurement_process_id: string
  entity_id: number
  record_id: string
  file_path: string
  uploaded_by: number
  upload_date: Date
}

export class Category {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';

  constructor() {
    this.id = '';
    this.name = '';
    this.code = '';
    this.description = '';
    this.status = 'Active';
  }
}

export class Asset {
  id: string;
  name: string;
  category: Category;
  status: string;
  serialNumber: string;
  model: string;
  barcode: string;
  qrCode: string;
  image: string;
  department: any;
  location: any;
  propertyType: any;
  purchaseDate: Date;
  purchaseCost: number;
  vendor: string;
  invoice: string;
  warrantyExpiry: Date;
  ownershipDetails: string;
  notes: string;
  repairHistory: any[];
  depreciation: number;

  constructor() {
    this.id = '';
    this.name = '';
    this.category = new Category();
    this.status = 'Active';
    this.serialNumber = '';
    this.model = '';
    this.barcode = '';
    this.qrCode = '';
    this.image = '';
    this.department = null;
    this.location = null;
    this.propertyType = null;
    this.purchaseDate = new Date();
    this.purchaseCost = 0;
    this.vendor = '';
    this.invoice = '';
    this.warrantyExpiry = new Date();
    this.ownershipDetails = '';
    this.notes = '';
    this.repairHistory = [];
    this.depreciation = 0;
  }
}

export class Transfer {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  noOfProducts: number;
  quantityTransferred: number;
  refNumber: string;
  date: Date;

  constructor() {
    this.id = '';
    this.fromWarehouse = '';
    this.toWarehouse = '';
    this.noOfProducts = 0;
    this.quantityTransferred = 0;
    this.refNumber = '';
    this.date = new Date();
  }
}

export class Items {
  id: string;
  product: string;
  barcode: string; // Use barcode as Item Code
  warehouse: string;
  category: string;
  quantity: number;
  dateAdded: Date;
  description: string;
  imageFile?: File;
  minimumQty: number;
  unit: string;
  status: string;
  brand?: string;
  subCategory?: string;

  constructor() {
    this.id = '';
    this.product = '';
    this.barcode = ''; // Initialize barcode
    this.warehouse = '';
    this.category = '';
    this.quantity = 0;
    this.dateAdded = new Date();
    this.description = '';
    this.minimumQty = 0;
    this.unit = '';
    this.status = '';
    this.brand = '';
    this.subCategory = '';
  }
}

export class Warehouse {
  id: string = '';
  name: string = '';
  building: string = '';
  products: Array<{
    name: string;
    image: string;
    quantity: number;
  }> = [];
  person: {
    id: number;
    name: string;
    image: string;
    position: string;
  } | null = null;  // Make person property nullable
}

export interface DocumentCategory {
  name: string;
  key: string;
  checked?: boolean;
}

@TableName('ConferenceEvent')
export class ConferenceEvent {
  id: string
  ppmp_id: string
  date: Date
  event_time: Date
  mode: EventMode
  platform?: string
  type: EventType
  created_by: string
  created_at: Date
  Invitation?: Invitation[]
  PPMPProject?: PPMPProject[]
}

@TableName('Invitation')
export class Invitation {
  id: string
  event_id: string
  ppmp_id: string
  date: Date
  time: Date
  mode: EventMode
  platform?: string
  participants: string[]
  type: EventType
  sent_by: string
  sent_at: Date
  ConferenceEvent?: ConferenceEvent
}

@TableName('PaymentTerm')
export class PaymentTerm {
  id: string
  code: string
  name: string
  description: string
  days: number
  percentageRequired: number
  isActive: boolean
}
  

// export class ObligationRequest {
//   id: string;
//   requestingOffice: string;
//   payee: string;
//   particulars: string;
//   fundSource: string;
//   accountCode: string;
//   amount: number;
//   uacsObjectCode: string;
//   supportingDocs: boolean;
//   status: 'Pending' | 'Approved' | 'Rejected';
//   date: string;
// }

@TableName('ObligationRequest')
export class ObligationRequest {
  id?: string;
  serialNo: string = '';
  entityName: string = '';
  date: string = '';
  fundSourceId: string = ''; // Fund Cluster
  requestingOffice: string = '';
  payee: string = '';
  address: string = '';
  responsibilityCenter: string = '';
  items: Array<{
    particulars: string;
    mfoPap: string;
    uacsObjectCode: string;
    amount: number;
  }>;
  supportingDocs: string[] = []; // Changed from boolean to string[]
  status: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
  obligationAmount?: number;
  payableNotYetDue?: number;
  payableDue: number = 0;
  paymentAmount: number = 0;
  balanceObligation?: number;
  balancePayable?: number;
  obligationReferences: { date: string; particulars: string; refNo: string }[] = [];
  requestDate: Date = new Date();
  accountCode: string = '';
  contractId?: string;

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
}