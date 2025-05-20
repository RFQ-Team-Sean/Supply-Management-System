// src/app/schema/schema.ts

import 'reflect-metadata'

function TableName(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata('table', tableName, target);
  };
}

@TableName('ProcurementProcess')
export class ProcurementProcess {
  id: string
  name: string
  process_order: number
  procurement_mode_id:'Public' | 'Alternative'
}

@TableName('ProcurementMode')
export class ProcurementMode {
  id: string 
  mode_name: string
  method: 'Public' | 'Alternative'
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
  fund_id:string
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

@TableName('PPMP')
export class PPMP {
  id: string
  office_id: string;
  app_id?: string
}

@TableName('PPMPProject')
export class PPMPProject {
  id: string
  ppmp_id: string  
  procurement_mode_id: string  
  prepared_by_id: string  
  project_title: string  
  project_code?: string 
  project_description: string
  classifications: string[]
  user_budget_id: string // si budget 
  abc?: number;  // update ig optional ko lang nguna | si budget /add
  contract_scope?: string // add 
  fiscal_year: number
  remarks?: string // add 

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
  technical_specification?: string; // For Goods
  scope_of_work?: string; // For Services and Infrastructure
  terms_of_reference?: string; // For Consulting Services
}

@TableName('PPMPSchedule')
export class PPMPSchedule { // end user nguna and then i veverify ni bac if pwede.
  id: string;
  ppmp_id: string;
  milestone: string;
  quarter:string;
  date: Date
}
@TableName('Approvals')
export class Approvals { 
  id: string
  approver_id: string
  document_id:string
  entity_id:string
  approval_status: 'Approved' | 'Rejected'
  remarks?: string
  signature?: string
  timestamp:Date
}

@TableName('Approver')
export class Approver {
  id: string
  user_id: string 
  entity_id: string
  name: string
  approval_order: number
  process_id?:string
}

@TableName('Entity')
export class Entity {
  id: number
  name: 'PPMP' | 'PurchaseRequest' | 'APP' | 'ProcurementProcess' | 'Contract' | 'InspectionAcceptance' | 'Payment'
  description?: string
}

@TableName('APP')
export class APP {
  id: string
  fund_source: string
  prepared_by: number
  approvals_id: string
  fiscal_year: number
  date_prepared: Date
  date_approved?: Date
  total_quantity_required: number
  total_estimated_cost: number
  // add 
}

@TableName('PurchaseRequest')
export class PurchaseRequest {
  id: string
  prNo: string
  user_id:string
  office_id:string
  project_id: string
  current_approver_level: number
  current_procurement_level?:number
  request_date: Date  
  status: 'Draft' | 'Pending' | 'Approved'
  signature?:string;
}

@TableName('VendorInfo')
export class VendorInfo {
  companyName: string
  tin: string
  address: string
  telFax: string
  email: string
}

@TableName('Department')
export class Department {
  id!: string
  name!: string
}
@TableName('Building')
export class Building {
  id!: string
  name!: string
  address!: string
  numberOfFloors!: number
  dateConstructed?: Date
}
@TableName('Office')
export class Office {
  id!: string
  department_id!: string
  building_id?: string
  name!: string
}
@TableName('Users')
export class Users {
  id: string
  fullname: string
  username: string
  password: string
  position?:string;
  user_type: 'SuperAdmin' | 'Admin' | 'User'
  role: 'superadmin' | 'accounting' | 'supply' | 'bac' | 'inspection' | 'enduser' | 'president'
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
  status: 'Active' | 'Completed' | 'Terminated'
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
  amount_paid: string
  payment_method: 'Check' | 'ADA'
}


@TableName('AuditTrail')
export class AuditTrail {
  id: string
  entity_id: string             // References Entity table for type
  record_id: string             // The ID of the specific record in the entity (e.g., PPMP ID)
  approvals_id: string
  action: 'Created' | 'Updated' | 'Approved' | 'Rejected' | 'Deleted'
  performed_by: string         // User ID who performed the action
  performed_at: Date           // Timestamp when the action was performed
  remarks?: string             // Additional comments if any
}

@TableName('Notification')
export class Notification {
  id: number
  message: string
  type: 'info'|'success'|'warning'|'error'
  created_at: Date
  is_read: boolean
  office_id?:string
  user_id?: string
  role?:Users['role']
}

@TableName('Document')
export class Document {
  id: number
  procurement_process_id: string
  entity_id: number             // References Entity table for type
  record_id: number             // The ID of the specific record in the entity
  file_path: string
  uploaded_by: number
  upload_date: Date
}

@TableName('ConferenceEvent')
export class ConferenceEvent {
  id: string;
  ppmp_id: string; 
  date: Date;
  event_time: Date;
  mode: 'Online' | 'In-Person' | 'Hybrid';
  platform?: string; 
  type: 'Pre-Procurement' | 'Pre-Bidding';
  created_by: string; 
  created_at: Date;
}
@TableName('Invitation')
export class Invitation {
  id: string;
  event_id: string; 
  ppmp_id: string; 
  date: Date;
  time: Date;
  mode: 'Online' | 'In-Person' | 'Hybrid';
  platform?: string;
  participants: string[]; 
  type: 'Pre-Procurement' | 'Pre-Bidding';
  sent_by: string; 
  sent_at: Date;
}
@TableName('PaymentTerm')
export class PaymentTerm {
  id: string;
  code: string;
  name: string;
  description: string;
  days: number;
  percentageRequired: number;
  isActive: boolean;
}

