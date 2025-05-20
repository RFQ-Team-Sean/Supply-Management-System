export type DeliveryStatus = 'Under Delivery' | 'Completed' | 'Cancelled' | 'Rejected' | 'For Approval' | 'Returned' | 'Incomplete';
type DeliverySubStatus = "Completed" | "Cancelled" | "Rejected" | "For Approval" | "Preparing Items" | "In Transit" | "Arrived" | "Verifying"


export class Category {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export class Asset {
  id: string;
  name: string;
  categoryId: string; // Reference to Category
  status: string;
  serialNumber: string;
  model: string;
  barcode: string;
  qrCode: string;
  image: string;
  departmentId: string | null; // Reference to Department
  locationId: string | null; // Reference to Location
  propertyTypeId: string | null; // Reference to PropertyType
  purchaseDate: Date;
  purchaseCost: number;
  vendor: string;
  invoice: string;
  warrantyExpiry: Date;
  ownershipDetails: string;
  notes: string;
  depreciation: number;
}

export class RepairHistory {
  id: string;
  assetId: string; // Reference to Asset
  description: string;
  date: Date;
  cost: number;
}

export class Transfer {
  id: string;
  fromWarehouseId: string; // Reference to Warehouse
  toWarehouseId: string; // Reference to Warehouse
  noOfProducts: number;
  quantityTransferred: number;
  refNumber: string;
  date: Date;
}

export class Items {
  id: string;
  productId: string; // Reference to Product
  barcode: string; // Use barcode as Item Code
  warehouseId: string; // Reference to Warehouse
  categoryId: string; // Reference to Category
  quantity: number;
  dateAdded: Date;
  description: string;
  imageFile?: File;
  minimumQty: number;
  unit: string;
  status: string;
  brand?: string;
  subCategory?: string;
}

export class Warehouse {
  id: string;
  name: string;
  building: string;
}

export class WarehouseProduct {
  id: string;
  warehouseId: string; // Reference to Warehouse
  name: string;
  image: string;
  quantity: number;
}

export class Person {
  id: number;
  name: string;
  image: string;
  position: string;
}

export interface DocumentCategory {
  name: string;
  key: string;
  checked?: boolean;
}

export interface RequestItemDetail {
  id?: number;
  itemName: string;
  itemType: string;
  unit: string;
  quantity: number;
  issueQuantity?: number;
  availableQuantity?: number;
  stockAvailable?: 'yes' | 'no';
  remarks?: string;
}

export interface RequestItem {
  id?: number;
  itemCode: string;
  codeNumber: string;
  department: string;
  requestedBy: string;
  dateRequest: Date;
  dateApproved?: Date;
  dateIssued?: Date;
  dateDelivered?: Date;
  status: 'Pending' | 'Approved' | 'Returned' | 'Issued' | 'Delivered';
  purpose?: string;
  remarks?: string;
  items: RequestItemDetail[];
}

export interface RequestedItem {
  itemName: string;
  itemType: string;
  quantity: number;
  availableQuantity: number;
  issueQuantity?: number;
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
  items: BorrowItemDetail[];
}

export interface BorrowItemDetail {
  id?: number;
  itemName: string;
  itemType: string;
  quantity: number;
  availableQuantity: number;
}

export interface DeliveryDetails {
  supplier: string | null;
  deliveryDate: Date | null;
}

export class Position {
  id: string;
  name: string;
}

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