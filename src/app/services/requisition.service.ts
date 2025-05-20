//src/app/services/requisition.service.ts

import { Injectable } from '@angular/core';
import { z } from 'zod';
import { GroupService } from './group.service';
import { UserService } from './user.service';
import { ApprovalSequence, ApprovalSequenceService } from './approval-sequence.service';
import { firstValueFrom } from 'rxjs';

/**
 * Zod schema for an Extended Requisition.
 */
export const requisitionSchema = z.object({
  id: z.string().length(6, "ID must be exactly 6 characters").optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().max(500).optional(),
  status: z.string(),
  classifiedItemId: z.string().length(32, "Classified Item ID is required"),
  group: z.string().min(1, "Group is required"),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      specifications: z.string().optional(),
      price: z.number().min(0, "Price cannot be negative"),
      status: z.enum(['pending', 'delivered', 'received']).optional(),
    })
  ),
  selectedGroups: z.array(z.string()).optional(),
  productQuantities: z.record(z.string(), z.number()).optional(),
  productSpecifications: z.record(z.string(), z.string()).optional(),
  ppmpAttachment: z.string().optional(),
  purchaseRequestAttachment: z.string().optional(),
  rfqAttachment: z.string().optional(),
  rfqFromSuppliersAttachment: z.array(z.string()).optional(),
  abstractOfQuotationAttachment: z.string().optional(),
  budgetUtilizationReportAttachment: z.string().optional(),
  noticeOfAwardAttachment: z.string().optional(),
  purchaseOrderAttachment: z.string().optional(),
  purchaseOrderId: z.string().length(6, "Purchase Order ID must be exactly 6 characters").optional(),
  noticeToProceedId: z.string().length(6, "Purchase Order ID must be exactly 6 characters").optional(),
  noticeToProceedAttachment: z.string().optional(),
  // Add issue slip related fields
  issueSlipAttachment: z.string().optional(),
  issueSlipId: z.string().length(6, "Issue Slip ID must be exactly 6 characters").optional(),
  issuedStocks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      price: z.number().min(0, "Price cannot be negative"),
      status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
      dateIssued: z.date().optional(),
    })
  ).optional(),
  issueSlipStatus: z.enum(['pending', 'completed', 'rejected']).optional(),
  dateCreated: z.coerce.date().optional(),
  lastModified: z.coerce.date().optional(),
  signature: z.string().optional(),
  createdByUserId: z.string().optional(),
  createdByUserName: z.string().optional(),
  approvalSequenceId: z.string().min(1, "Approval Sequence ID is required").optional(),
  currentApprovalLevel: z.number().min(1).default(1),
  approvalStatus: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  approvalHistory: z.array(
    z.object({
      level: z.number().min(1),
      status: z.enum(['Approved', 'Rejected']),
      timestamp: z.date().default(() => new Date()),
      comments: z.string().optional(),
      approversName: z.string().optional(),
      signature: z.string().optional(),
    })
  ).optional(),
});

// TypeScript type for usage in your code
export type Requisition = z.infer<typeof requisitionSchema>;

@Injectable({
  providedIn: 'root',
})
export class RequisitionService {
  private readonly STORAGE_KEY = 'requisitions';
  private requisitions: Requisition[] = [];

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private approvalSequenceService: ApprovalSequenceService
  ) {
    this.loadFromLocalStorage();
    if (!this.requisitions || this.requisitions.length === 0) {
      this.loadDummyData();
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.requisitions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load requisitions from localStorage:', error);
    }
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.requisitions));
    } catch (error) {
      console.error('Failed to save requisitions to localStorage:', error);
    }
  }

  // Generate a random 32-character hex ID
  private generate32CharId(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }


  private generate6DigitId(): string {
  return Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 10).toString()
  ).join('');
  }
  

  // Load some dummy data (optional)
private loadDummyData(): void {
  const dummy: Requisition[] = [
    // --- Dummy Requisition for PO-2024-001 ---
    {
      id: 'REQ-2024-001',
      title: 'IT Accessories Request',
      description: 'Request for power adapters and keyboards for new hires.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-2024-001',
      group: 'GRP-IT-001',
      products: [
        { id: 'item1_po-2024-001', name: 'Laptop Power Adapter', quantity: 10, price: 2500.00, specifications: 'Standard 65W USB-C Power Adapter', status: 'pending' },
        { id: 'item2_po-2024-001', name: 'Wireless Keyboard', quantity: 10, price: 2500.00, specifications: 'Full-size wireless keyboard with numpad', status: 'pending' }
      ],
      selectedGroups: ['GRP-IT-001'],
      productQuantities: { 'item1_po-2024-001': 10, 'item2_po-2024-001': 10 },
      productSpecifications: { 'item1_po-2024-001': 'Standard 65W USB-C Power Adapter', 'item2_po-2024-001': 'Full-size wireless keyboard with numpad' },
      purchaseOrderId: 'PO-2024-001',
      dateCreated: new Date('2024-02-15T10:00:00Z'),
      lastModified: new Date('2024-02-20T14:00:00Z'),
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [
        { level: 1, status: 'Approved', timestamp: new Date('2024-02-16T09:00:00Z'), comments: 'Budget OK.' },
        { level: 2, status: 'Approved', timestamp: new Date('2024-02-17T11:30:00Z'), comments: 'Specs OK.' },
        { level: 3, status: 'Approved', timestamp: new Date('2024-02-19T15:00:00Z'), comments: 'President OK.' },
      ],
    },
    // --- Add Dummy REQ-2024-002 ---
    {
      id: 'REQ-2024-002',
      title: 'Basic Office Supplies Request',
      description: 'Request for stapler and paper.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-2024-002',
      group: 'GRP-ADMIN-002',
      products: [
        {
          id: 'item1_po-2024-002',
          name: 'Stapler',
          quantity: 5,
          price: 500.00,
          specifications: 'Heavy-duty office stapler',
          status: 'pending'
        },
        {
          id: 'item2_po-2024-002',
          name: 'Printer Paper (Ream)',
          quantity: 5,
          price: 200.00,
          specifications: 'Standard A4 printer paper, 500 sheets',
          status: 'pending'
        }
      ],
      purchaseOrderId: 'PO-2024-002',
      dateCreated: new Date('2024-02-25T09:00:00Z'),
      lastModified: new Date('2024-03-01T10:00:00Z'),
      createdByUserId: 'adminUser2',
      createdByUserName: 'Admin User Two',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [],
    },
     // --- End Dummy REQ-2024-002 ---

    // --- Add Dummy REQ-2024-003 ---
    {
      id: 'REQ-2024-003',
      title: 'Executive Furniture Request',
      description: 'Request for executive desk and chair.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-2024-003',
      group: 'GRP-EXEC-001',
      products: [
        {
          id: 'item1_po-2024-003',
          name: 'Executive Desk',
          quantity: 1,
          price: 8000.00,
          specifications: 'Large executive desk with drawers',
          status: 'delivered' // Assume delivered since report is generated
        },
        {
          id: 'item2_po-2024-003',
          name: 'Leather Office Chair',
          quantity: 1,
          price: 4000.00,
          specifications: 'High-back leather executive chair',
          status: 'delivered' // Assume delivered since report is generated
        }
      ],
      purchaseOrderId: 'PO-2024-003',
      dateCreated: new Date('2024-03-01T09:00:00Z'),
      lastModified: new Date('2024-03-05T10:00:00Z'),
      createdByUserId: 'execUser1',
      createdByUserName: 'Executive User One',
      approvalSequenceId: 'SEQ-PROC-EXEC-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [],
    },
    // --- End Dummy REQ-2024-003 ---

    // --- Dummy Requisition for PO12345678 (John Doe) ---
    {
      id: 'REQ-OLD-001',
      title: 'Office Furniture Request - John Doe',
      description: 'Request for office chair and monitor.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-OLD-001',
      group: 'GRP-ADMIN-001', 
      products: [
        { id: 'item1_po12345678', name: 'Office Chair', quantity: 2, price: 4500.00, specifications: 'Ergonomic office chair with lumbar support', status: 'pending' },
        { id: 'item2_po12345678', name: 'Computer Monitor', quantity: 2, price: 750.25, specifications: '24-inch LCD Monitor with HDMI and DisplayPort', status: 'pending' }
      ],
      purchaseOrderId: 'PO12345678',
      dateCreated: new Date('2023-06-10T09:00:00Z'),
      lastModified: new Date('2023-06-15T10:00:00Z'),
      createdByUserId: 'adminUser1',
      createdByUserName: 'Admin User One',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [], // Simplified history for brevity
    },
    // --- Dummy Requisition for PO98765432 (Jane Smith) ---
    {
      id: 'REQ-OLD-002',
      title: 'Office Equipment Request - Jane Smith',
      description: 'Request for file cabinet and paper shredder.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-OLD-002',
      group: 'GRP-FINANCE-001',
      products: [
        { id: 'item1_po98765432', name: 'File Cabinet', quantity: 1, price: 2800.50, specifications: 'Four-drawer locking file cabinet', status: 'pending' },
        { id: 'item2_po98765432', name: 'Paper Shredder', quantity: 1, price: 1700.25, specifications: 'Cross-cut paper shredder with 10-sheet capacity', status: 'pending' }
      ],
      purchaseOrderId: 'PO98765432',
      dateCreated: new Date('2022-11-20T11:00:00Z'),
      lastModified: new Date('2022-11-30T13:00:00Z'),
      createdByUserId: 'financeUser1',
      createdByUserName: 'Finance User One',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [],
    },
    // --- Dummy Requisition for PO54321abc (Mark Brown) ---
    {
      id: 'REQ-OLD-003',
      title: 'Printer Request - Mark Brown',
      description: 'Request for a network printer.',
      status: 'Approved', // Or Cancelled if PO is cancelled
      classifiedItemId: 'dummyClassifiedItemId_REQ-OLD-003',
      group: 'GRP-MARKETING-001',
      products: [
        { id: 'item1_po54321abc', name: 'Printer', quantity: 1, price: 2300.30, specifications: 'Color laser printer with network capabilities', status: 'pending' }
      ],
      purchaseOrderId: 'PO54321abc',
      dateCreated: new Date('2023-01-01T14:00:00Z'),
      lastModified: new Date('2023-01-10T16:00:00Z'),
      createdByUserId: 'marketingUser1',
      createdByUserName: 'Marketing User One',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved', // Should match PO status logic ideally
      approvalHistory: [],
    },
    // --- Dummy Requisition for PO54300000 (Joshua Corda) ---
    {
      id: 'REQ-OLD-004',
      title: 'Meeting Room Supplies - Joshua Corda',
      description: 'Request for whiteboard and conference table.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-OLD-004',
      group: 'GRP-HR-001',
      products: [
        { id: 'item1_po54300000', name: 'Whiteboard', quantity: 1, price: 1200.15, specifications: '48" x 36" magnetic whiteboard with marker tray', status: 'pending' },
        { id: 'item2_po54300000', name: 'Conference Table', quantity: 1, price: 1100.15, specifications: '8-person oval conference table', status: 'pending' }
      ],
      purchaseOrderId: 'PO54300000',
      dateCreated: new Date('2023-01-02T10:00:00Z'),
      lastModified: new Date('2023-01-10T12:00:00Z'),
      createdByUserId: 'hrUser1',
      createdByUserName: 'HR User One',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [],
    },
     // --- Dummy Requisition for PO54300120 (Anton Caesar Cabais) ---
    {
      id: 'REQ-OLD-005',
      title: 'New Employee Setup - Anton Caesar Cabais',
      description: 'Request for desktop computer and office desk.',
      status: 'Approved',
      classifiedItemId: 'dummyClassifiedItemId_REQ-OLD-005',
      group: 'GRP-OPS-001',
      products: [
        { id: 'item1_po54300120', name: 'Desktop Computer', quantity: 1, price: 1500.15, specifications: 'Business desktop computer with i5 processor', status: 'pending' },
        { id: 'item2_po54300120', name: 'Office Desk', quantity: 1, price: 800.15, specifications: 'L-shaped corner desk with drawer', status: 'pending' }
      ],
      purchaseOrderId: 'PO54300120',
      dateCreated: new Date('2023-01-03T09:30:00Z'),
      lastModified: new Date('2023-01-10T11:30:00Z'),
      createdByUserId: 'opsUser1',
      createdByUserName: 'Operations User One',
      approvalSequenceId: 'SEQ-PROC-STD-01',
      currentApprovalLevel: 4,
      approvalStatus: 'Approved',
      approvalHistory: [],
    },

    // -- Keep existing dummy data below --
    // Level 1: Budget Unit Review (Procurement Flow)
    {
      id: '1111',
      title: 'Office Supplies Request',
      description: 'Request for stationery items.',
      status: 'Pending',
      classifiedItemId: 'dummyClassifiedItemId1',
      group: '12345678901234567890123456789012',
      products: [
        { id: '12345678901234567890123456789012', name: 'Pen', quantity: 10, price: 10, specifications: 'Blue ink' },
        { id: '23456789012345678901234567890123', name: 'Notebook', quantity: 5, price: 50, specifications: 'A5 size' },
      ],
      selectedGroups: ['Group1', 'Group2'],
      productQuantities: { '12345678901234567890123456789012': 10, '23456789012345678901234567890123': 5 },
      productSpecifications: { '12345678901234567890123456789012': 'Blue ink', '23456789012345678901234567890123': 'A5 size' },
      ppmpAttachment: 'ppmp-attachment-url-1',
      purchaseRequestAttachment: 'purchase-request-attachment-url-1',
      rfqAttachment: 'rfq-attachment-url-1',
      dateCreated: new Date('2023-10-01T08:00:00Z'),
      lastModified: new Date('2023-10-01T08:00:00Z'),
      signature: 'signature-url-1',
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: '111',
      currentApprovalLevel: 1,
      approvalStatus: 'Pending',
      approvalHistory: [], // No approvals yet
    },
    // Level 2: Technical Specification Review (Procurement Flow)
    {
      id: '2222',
      title: 'Electronics Request',
      description: 'Request for new laptops.',
      status: 'Pending',
      classifiedItemId: 'dummyClassifiedItemId2',
      group: '23456789012345678901234567890123',
      products: [
        { id: '34567890123456789012345678901234', name: 'Laptop', quantity: 2, price: 50000, specifications: '16GB RAM, 512GB SSD' },
      ],
      selectedGroups: ['Group3'],
      productQuantities: { '34567890123456789012345678901234': 2 },
      productSpecifications: { '34567890123456789012345678901234': '16GB RAM, 512GB SSD' },
      ppmpAttachment: 'ppmp-attachment-url-2',
      purchaseRequestAttachment: 'purchase-request-attachment-url-2',
      dateCreated: new Date('2023-10-02T09:00:00Z'),
      lastModified: new Date('2023-10-02T09:00:00Z'),
      signature: 'signature-url-2',
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: '222',
      currentApprovalLevel: 2,
      approvalStatus: 'Pending',
      approvalHistory: [
        { level: 1, status: 'Approved', timestamp: new Date('2023-10-01T10:00:00Z'), comments: 'Budget approved.' },
      ],
    },
    // Level 3: College President Approval (Procurement Flow)
    {
      id: '3333',
      title: 'Furniture Request',
      description: 'Request for office chairs and desks.',
      status: 'Pending',
      classifiedItemId: 'dummyClassifiedItemId3',
      group: '34567890123456789012345678901234',
      products: [
        { id: '45678901234567890123456789012345', name: 'Office Chair', quantity: 5, price: 2000, specifications: 'Ergonomic design' },
        { id: '56789012345678901234567890123456', name: 'Desk', quantity: 3, price: 5000, specifications: 'Adjustable height' },
      ],
      selectedGroups: ['Group4'],
      productQuantities: { '45678901234567890123456789012345': 5, '56789012345678901234567890123456': 3 },
      productSpecifications: { '45678901234567890123456789012345': 'Ergonomic design', '56789012345678901234567890123456': 'Adjustable height' },
      ppmpAttachment: 'ppmp-attachment-url-3',
      purchaseRequestAttachment: 'purchase-request-attachment-url-3',
      dateCreated: new Date('2023-10-03T10:00:00Z'),
      lastModified: new Date('2023-10-03T10:00:00Z'),
      signature: 'signature-url-3',
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: '333',
      currentApprovalLevel: 3,
      approvalStatus: 'Pending',
      approvalHistory: [
        { level: 1, status: 'Approved', timestamp: new Date('2023-10-02T09:00:00Z'), comments: 'Budget approved.' },
        { level: 2, status: 'Approved', timestamp: new Date('2023-10-03T14:30:00Z'), comments: 'Technical specifications verified.' },
      ],
    },
    // Level 4: BAC Final Review (Procurement Flow)
    {
      id: '4444',
      title: 'Software License Request',
      description: 'Request for software licenses for the IT department.',
      status: 'Pending',
      classifiedItemId: 'dummyClassifiedItemId4',
      group: '45678901234567890123456789012345',
      products: [
        { id: '67890123456789012345678901234567', name: 'Software License', quantity: 10, price: 1000, specifications: 'Annual subscription' },
      ],
      selectedGroups: ['Group5'],
      productQuantities: { '67890123456789012345678901234567': 10 },
      productSpecifications: { '67890123456789012345678901234567': 'Annual subscription' },
      ppmpAttachment: 'ppmp-attachment-url-4',
      purchaseRequestAttachment: 'purchase-request-attachment-url-4',
      dateCreated: new Date('2023-10-04T11:00:00Z'),
      lastModified: new Date('2023-10-04T11:00:00Z'),
      signature: 'signature-url-4',
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: '444',
      currentApprovalLevel: 4,
      approvalStatus: 'Pending',
      approvalHistory: [
        { level: 1, status: 'Approved', timestamp: new Date('2023-10-04T11:00:00Z'), comments: 'Budget approved.' },
        { level: 2, status: 'Approved', timestamp: new Date('2023-10-05T15:00:00Z'), comments: 'Technical specifications verified.' },
        { level: 3, status: 'Approved', timestamp: new Date('2023-10-06T10:00:00Z'), comments: 'Approved by College President.' },
      ],
    },
    // Level 5: Delivery Inspection (Supply Management Flow)
    {
      id: '5555',
      title: 'Projector Request',
      description: 'Request for projectors for the conference room.',
      status: 'Pending',
      classifiedItemId: 'dummyClassifiedItemId5',
      group: '56789012345678901234567890123456',
      products: [
        { id: '78901234567890123456789012345678', name: 'Projector', quantity: 3, price: 15000, specifications: 'HD resolution' },
      ],
      selectedGroups: ['Group6'],
      productQuantities: { '78901234567890123456789012345678': 3 },
      productSpecifications: { '78901234567890123456789012345678': 'HD resolution' },
      ppmpAttachment: 'ppmp-attachment-url-5',
      purchaseRequestAttachment: 'purchase-request-attachment-url-5',
      dateCreated: new Date('2023-10-07T12:00:00Z'),
      lastModified: new Date('2023-10-07T12:00:00Z'),
      signature: 'signature-url-5',
      createdByUserId: 'enduser',
      createdByUserName: 'Diana Green',
      approvalSequenceId: '555',
      currentApprovalLevel: 5,
      approvalStatus: 'Pending',
      approvalHistory: [
        { level: 1, status: 'Approved', timestamp: new Date('2023-10-07T12:00:00Z'), comments: 'Budget approved.' },
        { level: 2, status: 'Approved', timestamp: new Date('2023-10-08T16:00:00Z'), comments: 'Technical specifications verified.' },
        { level: 3, status: 'Approved', timestamp: new Date('2023-10-09T10:00:00Z'), comments: 'Approved by College President.' },
        { level: 4, status: 'Approved', timestamp: new Date('2023-10-10T09:00:00Z'), comments: 'Final review by BAC.' },
      ],
    },
  ];

  this.requisitions = dummy;
  this.saveToLocalStorage();
}

  // ================================
  // CRUD Methods
  // ================================

  /**
   * Fetch all requisitions.
   */
  getAllRequisitions(): Promise<Requisition[]> {
    return Promise.resolve(this.requisitions);
  }

  /**
   * Fetch all pending requisitions.
   */
  async getPendingRequisitions(): Promise<Requisition[]> {
    return this.requisitions.filter((req) => req.status === 'Pending');
  }

  /**
   * Add a new requisition.
   * @param data - The requisition data (without ID).
   */
  async addRequisition(data: Omit<Requisition, 'id'>): Promise<string> {
    const id =this.generate6DigitId();
    const currentUser = this.userService.getUser(); // Get the current logged-in user
    const newRequisition: Requisition = {
      ...data,
      id: id,
      createdByUserId: currentUser?.id || 'Unknown',
      createdByUserName: currentUser?.fullname || 'Unknown',
      currentApprovalLevel: 1, // Default to level 1
      approvalStatus: 'Pending', // Default to 'Pending'
      approvalHistory: [], // Initialize empty approval history
    };

    requisitionSchema.parse(newRequisition); // Validate the new requisition
    this.requisitions.push(newRequisition);
    this.saveToLocalStorage();
    return id
  }

  /**
   * Update an existing requisition.
   * @param requisition - The requisition to update.
   */
//   async updateRequisition(requisition: Requisition): Promise<void> {
//   try {
//     // Validate the requisition
//     requisitionSchema.parse(requisition);

//     // Find the index of the requisition
//     const index = this.requisitions.findIndex((r) => r.id === requisition.id);
//     if (index === -1) {
//       throw new Error('Requisition not found');
//     }

//     // Update the requisition
//     this.requisitions[index] = requisition;

//     // Save to local storage
//     this.saveToLocalStorage();
//   } catch (error) {
//     console.error('Error updating requisition:', error);
//     throw error;
//   }
  // }
  
//   async updateRequisition(requisition: Requisition): Promise<void> {
//   try {
//     // Convert timestamp strings to Date objects in approvalHistory
//     if (requisition.approvalHistory) {
//       requisition.approvalHistory = requisition.approvalHistory.map(history => ({
//         ...history,
//         timestamp: new Date(history.timestamp), // Convert string to Date
//       }));
//     }

//     // Validate the requisition
//     requisitionSchema.parse(requisition);

//     // Save the updated requisition
//     const index = this.requisitions.findIndex(req => req.id === requisition.id);
//     if (index !== -1) {
//       this.requisitions[index] = requisition;
//       this.saveToLocalStorage();
//     }
//   } catch (error) {
//     console.error('Error updating requisition:', error);
//     throw error;
//   }
  // }
  
async updateRequisition(requisition: Requisition): Promise<void> {
  try {
    // Convert timestamps to Date objects in approvalHistory
    if (requisition.approvalHistory) {
      requisition.approvalHistory = requisition.approvalHistory.map(history => ({
        ...history,
        timestamp: new Date(history.timestamp), // Ensure Date format
      }));
    }

    // Convert issued stocks dates if they exist
    if (requisition.issuedStocks) {
      requisition.issuedStocks = requisition.issuedStocks.map(stock => ({
        ...stock,
        dateIssued: new Date(stock.dateIssued || new Date()), // Ensure Date format
      }));
    }

    // Add lastModified timestamp
    requisition.lastModified = new Date();

    // Validate the requisition
    requisitionSchema.parse(requisition);

    // Get existing requisition
    const index = this.requisitions.findIndex(req => req.id === requisition.id);
    if (index !== -1) {
      // Merge with existing data to preserve other fields
      this.requisitions[index] = {
        ...this.requisitions[index],
        ...requisition,
        // Keep existing attachments if not provided in update
        ppmpAttachment: requisition.ppmpAttachment || this.requisitions[index].ppmpAttachment,
        purchaseRequestAttachment: requisition.purchaseRequestAttachment || this.requisitions[index].purchaseRequestAttachment,
        // Keep existing arrays if not provided in update
        products: requisition.products || this.requisitions[index].products,
        selectedGroups: requisition.selectedGroups || this.requisitions[index].selectedGroups,
        approvalHistory: requisition.approvalHistory || this.requisitions[index].approvalHistory,
        issuedStocks: requisition.issuedStocks || this.requisitions[index].issuedStocks,
      };
      this.saveToLocalStorage();
    } else {
      throw new Error('Requisition not found');
    }
  } catch (error) {
    console.error('Error updating requisition:', error);
    throw error;
  }
}


  /**
   * Update the status of a requisition.
   * @param requisitionId - The ID of the requisition.
   * @param status - The new status ('Approved' or 'Rejected').
   */
  updateRequisitionStatus(requisitionId: string, status: 'Approved' | 'Rejected'): Promise<void> {
    const requisition = this.requisitions.find((req) => req.id === requisitionId);
    if (requisition) {
      requisition.approvalStatus = status;
    }
    return Promise.resolve();
  }

  /**
   * Delete a requisition by ID.
   * @param id - The ID of the requisition to delete.
   */
  async deleteRequisition(id: string): Promise<void> {
    this.requisitions = this.requisitions.filter((r) => r.id !== id);
    this.saveToLocalStorage();
  }

  /**
   * Fetch a requisition by ID.
   * @param id - The ID of the requisition to fetch.
   */
  async getRequisitionById(id: string): Promise<Requisition | undefined> {
    return this.requisitions.find((r) => r.id === id);
  }

  /**
   * Assign an approval sequence to a requisition.
   * @param requisitionId - The ID of the requisition.
   * @param approvalSequenceId - The ID of the approval sequence.
   */
  async assignApprovalSequence(requisitionId: string, approvalSequenceId: string): Promise<void> {
    const requisition = this.requisitions.find((req) => req.id === requisitionId);
    if (!requisition) {
      throw new Error('Requisition not found');
    }

    requisition.approvalSequenceId = approvalSequenceId;
    requisition.currentApprovalLevel = 1; // Start at the first level
    requisition.approvalStatus = 'Pending'; // Set initial approval status
    this.saveToLocalStorage();
  }

  /**
   * Approve or reject a requisition.
   * @param requisitionId - The ID of the requisition.
   * @param status - The new status ('Approved' or 'Rejected').
   * @param signature - The Base64 string of the approver's signature.
   * @param comments - Optional comments from the approver.
   */
 async approveRequisition(
 requisitionId: string,
 status: 'Approved' | 'Rejected', 
 signature: string,
 comments?: string
): Promise<void> {
 const requisition = this.requisitions.find((req) => req.id === requisitionId);
 if (!requisition) {
   throw new Error('Requisition not found');
 }

 if (!requisition.approvalSequenceId || !requisition.currentApprovalLevel) {
   throw new Error('Approval sequence not assigned');
 }

 // Convert dates to Date objects
 requisition.dateCreated = new Date(requisition.dateCreated!);
 requisition.lastModified = new Date();

 // Fetch approval sequence
 const sequences = await firstValueFrom(
   this.approvalSequenceService.getSequencesByType('procurement')
 );

 const approvalSequence = sequences.find((seq) => seq.id === requisition.approvalSequenceId);
 if (!approvalSequence) {
   throw new Error('Approval sequence not found');
 }

 // Update requisition status
 requisition.status = status;
 requisition.signature = signature;

 // Handle approval history
 requisition.approvalHistory = requisition.approvalHistory || [];
 const newHistoryEntry = {
   level: requisition.currentApprovalLevel,
   status,
   timestamp: new Date(),
   comments,
   approversName: this.userService.getUser()?.fullname || 'Unknown', 
   signature: signature, 
 };
 requisition.approvalHistory = [
   ...requisition.approvalHistory.map(h => ({
     ...h,
     timestamp: new Date(h.timestamp)
   })),
   newHistoryEntry
 ];

 if (status === 'Approved') {
   requisition.currentApprovalLevel += 1;
   const maxLevel = approvalSequence.level;
   requisition.approvalStatus = requisition.currentApprovalLevel > maxLevel ? 'Approved' : 'Pending';
 } else {
   requisition.approvalStatus = 'Rejected';
 }

 await this.updateRequisition(requisition);
 this.saveToLocalStorage();
}

  /**
   * Fetch requisitions with their approval sequence details.
   */
  async getRequisitionsWithApprovalDetails(): Promise<(Requisition & { approvalSequenceDetails?: ApprovalSequence })[]> {
    const requisitions = await this.getAllRequisitions(); // Fetch all requisitions
    const approvalSequences = (await this.approvalSequenceService.getAllSequences().toPromise()) || [];

    // Map requisitions to include the entire approval sequence details
    return requisitions.map((req) => {
      const sequence = approvalSequences.find((seq) => seq.id === req.approvalSequenceId);
      return {
        ...req,
        approvalSequenceDetails: sequence, // Add the entire approval sequence details
      };
    });
  }

   async getApprovalSequenceDetails(
    approvalSequenceId: string,
    currentApprovalLevel: number
  ): Promise<ApprovalSequence | undefined> {
    try {
      // Fetch all approval sequences
      const sequences = await this.approvalSequenceService
        .getAllSequences()
        .toPromise();

      if (!sequences) {
        throw new Error('Failed to fetch approval sequences');
      }

      // Find the sequence with the matching ID and level
      const sequence = sequences.find(
        (seq) =>
          seq.id === approvalSequenceId && seq.level === currentApprovalLevel
      );

      return sequence;
    } catch (error) {
      console.error('Failed to fetch approval sequence details:', error);
      return undefined;
    }
   }
  
  /**
 * Load the userFullName from the ApprovalSequence data schema for a given requisition.
 * @param requisitionId - The ID of the requisition.
 * @returns A promise that resolves to the userFullName or undefined if not found.
 */
async loadUserFullName(requisitionId: string): Promise<string | undefined> {
  try {
    // Find the requisition by ID
    const requisition = this.requisitions.find((req) => req.id === requisitionId);
    if (!requisition) {
      throw new Error(`Requisition with ID ${requisitionId} not found.`);
    }

    // Fetch the approval sequence using the requisition's approvalSequenceId
    const approvalSequence = await this.approvalSequenceService
      .getSequenceById(requisition.approvalSequenceId??'#')
      .toPromise();

    if (!approvalSequence) {
      console.warn(`Approval sequence with ID ${requisition.approvalSequenceId} not found.`);
      return undefined;
    }

    // Return the userFullName from the approval sequence
    return approvalSequence.userFullName;
  } catch (error) {
    console.error('Failed to load userFullName:', error);
    return undefined;
  }
}
  
  async getAllApprovalSequences(): Promise<ApprovalSequence[]> {
  try {
    const sequences = await this.approvalSequenceService.getAllSequences().toPromise();
    if (!sequences) {
      throw new Error('No approval sequences found');
    }
    return sequences;
  } catch (error) {
    console.error('Failed to fetch all approval sequences:', error);
    return [];
  }
  }
  
   async updatePurchaseOrderId(requisitionId: string, purchaseOrderId: string): Promise<void> {
    const requisition = this.requisitions.find((r) => r.id === requisitionId);
    if (!requisition) {
      throw new Error('Requisition not found');
    }

    requisition.purchaseOrderId = purchaseOrderId;
    await this.updateRequisition(requisition);
  }


  async updateNoticeToProceedId(requisitionId: string, noticeToProceedId: string): Promise<void> {
  const requisition = this.requisitions.find((r) => r.id === requisitionId);
  if (!requisition) {
    throw new Error('Requisition not found');
  }

  requisition.noticeToProceedId = noticeToProceedId;
  await this.updateRequisition(requisition);
}

}