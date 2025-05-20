// src/app/schema/schema.ts

import { Table } from 'jspdf-autotable';
import 'reflect-metadata'

export function TableName(tableName: string) {
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

export type UserRole = 'superadmin' | 'accounting' | 'supply' | 'bac' | 'inspection' | 'enduser' | 'president' | 'supplier' ;

export type ContractStatus = 'Active' | 'Completed' | 'Terminated';

export type PaymentMethod = 'Check' | 'ADA';

export type AuditAction = 'Created' | 'Updated' | 'Approved' | 'Rejected' | 'Deleted';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type EventMode = 'Online' | 'InPerson' | 'Hybrid';

export type EventType = 'PreProcurement' | 'PreBidding';

export type InvitationStatus = 'Pending' | 'Completed';

export type RequestItemStatus = 'Pending' | 'Approved' | 'Returned' | 'Issued';
export type DeliveryStatus = 'Under Delivery' | 'Completed' | 'Cancelled' | 'Rejected' | 'For Approval' | 'Returned' | 'Incomplete';
export type DeliverySubStatus = 'Preparing Items' | 'In Transit' | 'Arrived' | 'Verifying' | 'Completed' | 'Cancelled' | 'Rejected' | 'For Approval';

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

@TableName('SupplierDetails')
export class SupplierDetails {
    id?: string;
    name?: string;
    User_id: string;
    contact_person: string;
    contact_number: string;
    email: string;
    address: string;
    tin_number: string;
    sec_number: string;
    dti_number: string;
    mayors_permit: string;
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
  minutes?: string
  ConferenceEvent?: ConferenceEvent
  status?: InvitationStatus
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

@TableName('DeliveryReceipt')
export class DeliveryReceipt {
  id!: string;  // Make id required with !
  receipt_number: string;
  supplier_id: string;
  department_id?: string;
  department_name?: string;
  supplier_name: string;
  delivery_date: Date;
  supporting_documents?: string[];
  total_amount: number;
  notes?: string;
  status: 'unverified' | 'processing' | 'verified' | 'completed';
  purchase_order?: string;
  stocked: boolean;
  receipt_files: string[];
  supplier_tin: string;
  created_at?: Date;
  updated_at?: Date;
  hasInvoice?: boolean;
  vatType: 'vat' | 'non-vat'; // Add this line
}

//Reports Generation
@TableName('ICS')
export class ICS {
  ics_no: string;
  fund_cluster: string;
  entity_name: string;
  date: Date;
  inventory_item_no: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  description: string | null;
  estimated_useful_life: string;
  created_at: Date;
  updated_at: Date;
}

@TableName('IAR')
export class IAR {
    id: string;
    iar_no: string;
    po_no: string;
    supplier: string;
    date: Date;
    invoice_no: string;
    total_amount: number;
    status: string;
    remarks?: string;
    created_at?: Date;
}

@TableName('RPCI')
export class RPCI {
  id: string;
  rpci_no: string;
  fund_cluster: string;
  date: Date;
  department: string;
  accountable_officer: string;
  total_value: number;
  status: string;
  remarks: string;
  created_at: Date;
}


@TableName('RPCPPE')
export class RPCPPE {
  id: string;
  rpcppeNo: string;
  entityName: string;
  fundCluster: string;
  accountableOfficer: string;
  designation: string;
  accountabilityDate: Date;
  date: Date;
  totalValue: number;
  remarks: string;
  status: 'draft' | 'final';
  items: RPCPPEItem[];
}

@TableName('RPCPPEItem')
export class RPCPPEItem {
  id: string;
  rpcppeId: string;
  article: string;
  description: string;
  propertyNo: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  shortageQty: number;
  shortageValue: number;
  remarks: string;

}

@TableName('IIRUP')
export class IIRUP {
    id: string;
    iirupNo: string;
    entityName: string;
    fundCluster: string;
    department: string;
    accountableOfficer: string;
    designation: string;
    date: Date;
    items: IIRUPItem[];
    totalValue: number;
    disposalType: 'Sale' | 'Transfer' | 'Destruction' | 'Others';
    remarks: string;
    status: 'draft' | 'final';

    constructor() {
        this.id = '';
        this.iirupNo = '';
        this.entityName = '';
        this.fundCluster = '';
        this.department = '';
        this.accountableOfficer = '';
        this.designation = '';
        this.date = new Date();
        this.items = [];
        this.totalValue = 0;
        this.disposalType = 'Sale';
        this.remarks = '';
        this.status = 'draft';
    }
}

@TableName('IIRUPItem')
export class IIRUPItem {
    id: string;
    iirupId: string;
    dateAcquired: Date;
    article: string;
    propertyNo: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    remarks: string;
    disposalType: 'Sale' | 'Transfer' | 'Destruction' | 'Others';
    appraisedValue: number;
    salesAmount: number;
}

@TableName('PTR')
export class PTR {
    id: string;
    ptrNo: string;
    entityName: string;
    fundCluster: string;
    fromOfficer: string;
    fromDepartment: string;
    fromFundCluster: string;
    toOfficer: string;
    toDepartment: string;
    toFundCluster: string;
    date: Date;
    transferType: 'Donation' | 'Relocate' | 'Reassignment' | 'Others';
    otherTransferType?: string;
    items: PTRItem[];
    totalValue: number;
    transferReason: string;
    remarks: string;
    status: 'draft' | 'final';

    constructor() {
        this.id = '';
        this.ptrNo = '';
        this.entityName = '';
        this.fundCluster = '';
        this.fromOfficer = '';
        this.fromDepartment = '';
        this.fromFundCluster = '';
        this.toOfficer = '';
        this.toDepartment = '';
        this.toFundCluster = '';
        this.date = new Date();
        this.transferType = 'Relocate';
        this.items = [];
        this.totalValue = 0;
        this.transferReason = '';
        this.remarks = '';
        this.status = 'draft';
    }
}

@TableName('PTRItem')
export class PTRItem {
    id: string;
    ptrId: string;
    dateAcquired: Date;
    propertyNo: string;
    description: string;
    amount: number;
    condition: string;
}

@TableName('PAR')
export class PAR {
    id: string;
    parNo: string;
    entityName: string;
    fundCluster: string;
    receivedBy: string;
    receivedFrom: string;
    date: Date;
    items: PARItem[];
    status: 'draft' | 'final';
}

@TableName('PARItem')
export class PARItem {
    id: string;
    parId: string;
    propertyNo: string;
    description: string;
    quantity: number;
    unit: string;
}

@TableName('RLSDDP')
export class RLSDDP {
    id: string;
    rlsddpNo: string;
    entityName: string;
    fundCluster: string;
    department: string;
    accountableOfficer: string;
    designation: string;
    date: Date;
    parNo: string;
    policeNotified: boolean;
    policeStation?: string;
    policeNotificationDate?: Date;
    propertyStatus: 'Lost' | 'Stolen' | 'Damaged' | 'Destroyed';
    items: RLSDDPItem[];
    circumstances: string;
    totalValue: number;
    govtIdNo?: string;
    govtIdDateIssued?: Date;
    status: 'draft' | 'final';

    constructor() {
        this.id = '';
        this.rlsddpNo = '';
        this.entityName = '';
        this.fundCluster = '';
        this.department = '';
        this.accountableOfficer = '';
        this.designation = '';
        this.date = new Date();
        this.parNo = '';
        this.policeNotified = false;
        this.propertyStatus = 'Lost';
        this.items = [];
        this.circumstances = '';
        this.totalValue = 0;
        this.status = 'draft';
    }
}

@TableName('RLSDDPItem')
export class RLSDDPItem {
    id: string;
    rlsddpId: string;
    propertyNo: string;
    description: string;
    dateAcquired: Date;
    acquisitionCost: number;
    propertyStatus: 'Lost' | 'Stolen' | 'Damaged' | 'Destroyed';
    remarks: string;
}

@TableName('Category')
export class Category {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@TableName('Asset')
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
}

@TableName('Transfer')
export class Transfer {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  noOfProducts: number;
  quantityTransferred: number;
  refNumber: string;
  date: Date;
}

@TableName('Items')
export class Items {
  id: string;
  product: string;
  barcode: string;
  warehouse: string;
  category: string;
  quantity: number;
  dateAdded: Date;
  description: string;
  imageUrl?: string;
  imageFile?: File;
  minimumQty: number;
  unit: string;
  status: string;
  brand?: string;
  subCategory?: string;
}

@TableName('ObligationRequest')
export class ObligationRequest {
  id?: string;
  serialNo: string = '';
  entityName: string = '';
  date: string = '';
  fundSourceId: string = '';
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
  supportingDocs: string[] = [];
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
  totalAmount: number = 0;
}

export interface WarehouseProduct {
  name: string;
  image: string;
  quantity: number;
  showHistory?: boolean;
}

export class Warehouse {
  id: string = '';
  name: string = '';
  building: string = '';
  products: WarehouseProduct[] = [];
  person: {
    id: number;
    name: string;
    image: string;
    position: string;
  } | null = null;
}

@TableName('RequestItemDetail')
export class RequestItemDetail {
  id: number;
  stockNo: string;
  itemName: string;
  itemType: string;
  unit: string;
  quantity: number;
  issueQuantity?: number;
  stockAvailable: 'yes' | 'no' | string;
  remarks?: string;
  availableQuantity?: number;
  selectedItem?: Items | null;
}

@TableName('RequestItem')
export class RequestItem {
  id?: number;
  itemCode: string;
  codeNumber: string;
  department: string;
  requestedBy: string;
  dateRequest: Date;
  dateApproved?: Date;
  approvedBy?: string;
  approverPosition?: string;
  dateIssued?: Date;
  issuedBy?: string;
  issuerPosition?: string;
  dateDelivered?: Date;
  status: RequestItemStatus;
  purpose?: string;
  remarks?: string;
  deliveryLocation?: string;
  items: RequestItemDetail[];
  isBeingDelivered?: boolean;
  previousRequestId?: number;
  isResubmission?: boolean;
  originalReturnRemarks?: string;
}

export interface BorrowItem {
  id: number;
  itemCode: string;
  department: string;
  borrowedBy: string;
  dateBorrowed: Date;
  returnDate: Date;
  purpose: string;
  status: string;
  remarks?: string;
  items: {
    itemName: string;
    itemType: string;
    quantity: number;
    availableQuantity: number;
  }[];
}

export interface BorrowItemDetail {
  id?: number;
  itemName: string;
  itemType: string;
  quantity: number;
  availableQuantity: number;
}

export interface DeliveryDetails {
  deliveryDate: Date | null;
}

export class Position {
  id: string;
  name: string;
}

@TableName('StockRequest')
export class StockRequest {
  id: string;
  requestId: string;
  requesterName: string;
  requesterDepartment: string;
  requestDate: Date;
  priorityLevel: string;
  itemName: string;
  itemCode: string;
  quantityRequested: number;
  unitOfMeasurement: string;
  reasonForRequest: string;
  approverName: string;
  approvalStatus: string;
  estimatedDeliveryDate: Date | null;
  currentStockAvailability: string;
  supplierDetails: string;
  deliveryLocation: string;
  requestStatus: string;
  dateAdded: Date;
}

@TableName('StockDetail')
export class StockDetail {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  isVerified?: boolean;
  deliveryStatus?: DeliveryStatus;
  dateReceived?: Date;
  remarks?: string;
  itemCode: string;
  itemType: string;
  deliveredQuantity?: number;
}

@TableName('DeliveredStock') 
export class DeliveredStock {
  id: string | number;
  supplier: string;
  receiptNo: string | number;
  requisitionNumber?: string;
  dateDelivered: Date;
  department: string;
  status: DeliveryStatus;
  subStatus?: DeliverySubStatus;
  statusUpdateTime?: Date;
  requestedBy?: string;
  dateRequested?: Date;
  poNumber?: number;
  remarks?: string;
  followUpAction?: string;
  expectedCompletionDate?: Date;
  deliveryAddress?: string;
  division?: string;
  fundCluster?: string;
  approvedBy?: string;
  issuedBy?: string;
  cancelledBy?: string;
  cancellerPosition?: string;
  cancellationDate?: Date;
  details: StockDetail[];
  purpose?: string;
  returnedToInventory?: boolean;
  returnTime?: Date;
}

export class Location {
  id: string = '';
  name: string = '';
  address?: string;
  description?: string;
  code?: string;
}

export class PropertyType {
  id: string = '';
  name: string = '';
  description?: string;
  code?: string;
}

@TableName('QuotationRequest')
export class QuotationRequest {
  id: string = '';
  supplierId: string = '';
  requesterId: string = '';
  subject: string = '';
  message: string = '';
  attachments: string[] = [];
  dateRequested: Date = new Date();
  status: 'pending' | 'approved' | 'rejected' = 'pending';
  supplierName: string = '';
  supplierContact: string = '';
  supplierEmail: string = '';
  responseDate?: Date;
  price?: number;
  estimatedDeliveryDate?: Date;
  responseNotes?: string;
}

@TableName('SupplierItems')
export class SupplierItems {
  id: string = '';
  product: string = '';
  barcode: string = '';
  warehouse: string = '';
  category: string = '';
  quantity: number = 0;
  dateAdded: Date = new Date();
  description: string = '';
  imageUrl?: string;
  imageFile?: File;
  minimumQty: number = 0;
  unit: string = '';
  status: string = 'Available';
  brand?: string;
  subCategory?: string;
}

