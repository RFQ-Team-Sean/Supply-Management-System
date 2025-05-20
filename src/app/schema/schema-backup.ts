// src/app/schema/schema.ts

import 'reflect-metadata'

function TableName(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata('table', tableName, target);
  };
}

export type ProcurementMethod = 'Public' | 'Alternative';

export type ProjectStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type ApprovalStatus = 'Approved' | 'Rejected';

export type EntityType = 'PPMP' | 'PurchaseRequest' | 'APP' | 'ProcurementProcess' | 'Contract' | 'InspectionAcceptance' | 'Payment';

export type RequestStatus = 'Draft' | 'Pending' | 'Approved';

export type UserType = 'SuperAdmin' | 'Admin' | 'User';

export type UserRole = 'superadmin' | 'accounting' | 'supply' | 'bac' | 'inspection' | 'enduser' | 'president';

export type ContractStatus = 'Active' | 'Completed' | 'Terminated';

export type PaymentMethod = 'Check' | 'ADA';

export type AuditAction = 'Created' | 'Updated' | 'Approved' | 'Rejected' | 'Deleted';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type EventMode = 'Online' | 'InPerson' | 'Hybrid';

export type EventType = 'PreProcurement' | 'PreBidding';

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
}

@TableName('FundSource')
export class FundSource {
  id: string
  source_name: string
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
}

@TableName('UserBudget')
export class UserBudget {
  id: string
  user_id: string
  budget_id: string
  allocated_amount: number
  used_amount: number
  date_allocated: Date
}

@TableName('PPMPProject')
export class PPMPProject {
  id: string
  office_id: string
  app_id?: string
  procurement_mode_id: string
  prepared_by_id: string
  project_title: string
  project_code?: string
  project_description: string
  classifications: string[]
  user_budget_id: string
  abc?: number
  contract_scope?: string
  fiscal_year: number
  remarks?: string
  signature?: string
  status: ProjectStatus
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
}

@TableName('PPMPSchedule')
export class PPMPSchedule {
  id: string
  ppmp_id: string
  milestone: string
  date: Date
}

@TableName('Approvals')
export class Approvals {
  id: string
  approver_id: string
  entity_id: string
  document_id: string
  approval_status: ApprovalStatus
  remarks?: string
  signature?: string
  timestamp: Date
}

@TableName('Approver')
export class Approver {
  id: string
  user_id: string
  entity_id: string
  name: string
  approval_order: number
  process_id?: string
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
}

@TableName('Building')
export class Building {
  id: string
  name: string
  address: string
  numberOfFloors: number
  dateConstructed?: Date
}

@TableName('Office')
export class Office {
  id: string
  department_id: string
  building_id?: string
  name: string
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
  status: ContractStatus
}

@TableName('InspectionAcceptance')
export class InspectionAcceptance {
  id: string
  contract_id: string
  inspected_by: number
  inspection_date: Date
  signature: string
  remarks?: string
}

@TableName('Payment')
export class Payment {
  id: string
  contract_id: string
  disbursement_voucher_date: Date
  payment_date: Date
  amount_paid: number
  payment_method: PaymentMethod
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
  record_id: number
  file_path: string
  uploaded_by: number
  upload_date: Date
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