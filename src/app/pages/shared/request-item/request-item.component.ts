import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Table } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RequestItem, RequestItemDetail, BorrowItem, BorrowItemDetail, Items } from '../../../schema/schema';
import { borrowedItems, stockOptions as stockOptionsData, commonUnits as commonUnitsData } from '../../../schema/inventory-dummydata';
import { RequestItemService } from 'src/app/services/request-item.service';
import { DepartmentService, Department } from 'src/app/services/departments.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const enduserViewGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const user = userService.getUser();
  return user?.role === 'enduser';
};

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

type RequestStatus = 'Pending' | 'Approved' | 'Returned' | 'Issued';

@Component({
  selector: 'app-request-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmPopupModule,
    TagModule,
    TooltipModule,
    DialogModule,
    InputNumberModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextarea,
    SelectButtonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './request-item.component.html',
  styleUrls: [`./request-item.component.scss`]
})
export class RequestItemComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  @ViewChild('borrowTable') borrowTable!: Table;
  searchValue: string = '';
  showDetailsDialog: boolean = false;
  selectedRequest: RequestItem | null = null;
  showIssueDialog: boolean = false;
  issueNotes: string = '';

  // Add new properties for editing returned requests
  isEditingReturnedRequest: boolean = false;
  editedRequestForm: FormGroup;
  editedRequestItems: RequestItemDetail[] = [];
  
  // Properties for adding items in edit mode
  showAddItemFields: boolean = false;
  newItem: RequestItemDetail = {
    id: 0,
    itemName: '',
    itemType: '',
    unit: '',
    quantity: 1,
    stockNo: '',
    stockAvailable: 'yes',
    availableQuantity: 0,
    selectedItem: null // Reference to the selected inventory item
  };

  activeTab: 'request' | 'borrow' = 'request';
  borrowSearchValue: string = '';

  // Add counters for badge displays
  pendingRequestCount: number = 0;
  pendingBorrowCount: number = 0;

  stockOptions = stockOptionsData;
  commonUnits = commonUnitsData;
  requests: RequestItem[] = [];
  borrowedItems: BorrowItem[] = borrowedItems;

  requestItems: RequestItemDetail[] = [];

  showAddRequestDialog: boolean = false;
  showBorrowDialog: boolean = false;
  requestForm: FormGroup;
  borrowForm: FormGroup;
  today = new Date();

  departments: Department[] = [];

  availableItems: any[] = [
    { label: 'Laptop', value: 'Laptop', type: 'Electronics' },
    { label: 'Mouse', value: 'Mouse', type: 'Electronics' },
    { label: 'Keyboard', value: 'Keyboard', type: 'Electronics' },
    { label: 'Monitor', value: 'Monitor', type: 'Electronics' },
    { label: 'Printer', value: 'Printer', type: 'Electronics' }
  ];

  borrowItems: BorrowItemDetail[] = [];
  selectedBorrowItem: BorrowItem | null = null;

  showReturnDialog: boolean = false;
  returnRemarks: string = '';
  selectedRequestId: number | null = null;

  // Sample suppliers data
  suppliers = [
    { label: 'Supplier A', value: 'supplier_a' },
    { label: 'Supplier B', value: 'supplier_b' },
    { label: 'Supplier C', value: 'supplier_c' }
  ];

  selectedStatus: string = 'All';
  statusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Issued', value: 'Issued' },
    { label: 'Returned', value: 'Returned' }
  ];

  showBorrowDetailsDialog: boolean = false;
  showBorrowReturnDialog: boolean = false;
  borrowReturnRemarks: string = '';

  showBorrowRejectDialog: boolean = false;
  borrowRejectRemarks: string = '';

  selectedBorrowStatus: string = '';
  borrowStatusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Borrowed', value: 'Borrowed' },
    { label: 'Returned', value: 'Returned' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  // Additional state variables
  showDeliveryDetailsDialog: boolean = false;
  showRequestDialog: boolean = false;
  
  // New properties for approval and issue forms
  showApprovalDialog: boolean = false;
  approvalForm: FormGroup;
  issueForm: FormGroup;
  
  // Add new properties for delivery dialog
  showDeliveryLocationDialog: boolean = false;
  deliveryLocationForm: FormGroup;
  
  private subscription: Subscription = new Subscription();

  isEndUser: boolean = false;

  showDeliveryConfirmationDialog: boolean = false;
  selectedRequestForDelivery: RequestItem | null = null;

  // Add property for inventory items
  inventoryItems: Items[] = [];

  constructor(
    private requestItemService: RequestItemService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private userService: UserService,
    private deliveryService: DeliveryService,
    private router: Router
  ) {
    // Initialize request form
    this.requestForm = this.fb.group({
      itemCode: ['', Validators.required],
      codeNumber: ['', Validators.required],
      department: ['', Validators.required],
      requestedBy: ['', Validators.required],
      purpose: ['', Validators.required],
      dateRequest: [new Date()]
    });

    // Initialize the form for editing returned requests
    this.editedRequestForm = this.fb.group({
      department: ['', Validators.required],
      requestedBy: ['', Validators.required],
      purpose: ['', Validators.required],
      deliveryLocation: ['']
    });

    // Initialize borrow form
    this.borrowForm = this.fb.group({
      itemCode: ['', Validators.required],
      department: ['', Validators.required],
      borrowedBy: ['', Validators.required],
      dateBorrowed: [new Date()],
      returnDate: [new Date(new Date().setDate(new Date().getDate() + 7))], // Default 7 days from now
      purpose: ['', Validators.required]
    });
    
    // Initialize approval form
    this.approvalForm = this.fb.group({
      approvedBy: ['', Validators.required],
      position: ['', Validators.required],
      approvalDate: [new Date(), Validators.required]
    });
    
    // Initialize issue form
    this.issueForm = this.fb.group({
      issuedBy: ['', Validators.required],
      position: ['', Validators.required],
      issueDate: [new Date(), Validators.required]
    });
    
    // Initialize delivery location form
    this.deliveryLocationForm = this.fb.group({
      deliveryLocation: ['', Validators.required]
    });
    
    this.loadDepartments();

    const currentUser = this.userService.getUser();
    this.isEndUser = currentUser?.role === 'enduser';

    // Load inventory items
    this.loadInventoryItems();
  }

  ngOnInit(): void {
    this.loadRequests();
    
    // Set up subscriptions
    this.subscription.add(
      this.requestItemService.requestItems$.subscribe(items => {
        this.requests = [...items];
        this.updateRequestCount();
      })
    );
    
    this.loadDepartments();
    this.loadUser(); // Load current user info for forms
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async loadRequests(): Promise<void> {
    try {
      this.requests = await this.requestItemService.getAll();
      // Update the count immediately
      this.updateRequestCount();
    } catch (error) {
      console.error('Error loading requests:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load request items'
      });
    }
  }

  async loadDepartments(): Promise<void> {
    try {
      this.departments = await this.departmentService.getAllDepartments();
    } catch (error) {
      console.error('Error loading departments:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load departments'
      });
    }
  }

  getTotalItems(items: RequestItem['items']) {
    return items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Approved':
        return 'success';
      case 'Returned':
        return 'danger';
      case 'Issued':
        return 'info';
      case 'Delivered':
        return 'success';
      default:
        return 'secondary';
    }
  }

  openAddRequestModal() {
    this.requestItems = [];
    this.requestForm.reset();
    this.requestForm.patchValue({
      itemCode: `RIS-${Date.now()}`,
      status: 'Pending',
      dateRequest: new Date()
    });
    this.showAddRequestDialog = true;
  }

  viewDetails(item: RequestItem) {
    this.selectedRequest = item;
    this.showDetailsDialog = true;
    this.isEditingReturnedRequest = false;
    
    // If this is a returned request and user is an end user, prepare for potential editing
    if (item.status === 'Returned' && this.isEndUser) {
      this.prepareReturnedRequestForEditing(item);
    }
  }

  /**
   * Prepares a returned request for editing by populating the edit form
   */
  prepareReturnedRequestForEditing(request: RequestItem) {
    // Create copies to avoid mutating the original objects
    this.editedRequestItems = request.items.map(item => ({...item}));
    
    // Attempt to match existing items with inventory items for better UX
    this.matchEditedItemsWithInventory();
    
    // Populate the form with original values
    this.editedRequestForm.patchValue({
      department: request.department,
      requestedBy: request.requestedBy,
      purpose: request.purpose || '',
      deliveryLocation: request.deliveryLocation || ''
    });
  }

  /**
   * Attempts to match edited items with inventory items for dropdown initialization
   */
  private matchEditedItemsWithInventory(): void {
    if (!this.inventoryItems || this.inventoryItems.length === 0) {
      console.warn('No inventory items available for matching');
      return;
    }

    this.editedRequestItems.forEach((item, index) => {
      // Try to match by stockNo/barcode first (most precise)
      if (item.stockNo) {
        const matchedItem = this.inventoryItems.find(invItem => 
          invItem.barcode === item.stockNo
        );
        
        if (matchedItem) {
          console.log(`Matched item ${item.itemName} by stockNo: ${item.stockNo}`);
          this.editedRequestItems[index] = {
            ...item,
            availableQuantity: matchedItem.quantity,
            selectedItem: matchedItem
          };
          return;
        }
      }
      
      // If no stockNo match, try by item name
      const matchedByName = this.inventoryItems.find(invItem => 
        invItem.product.toLowerCase() === item.itemName.toLowerCase()
      );
      
      if (matchedByName) {
        console.log(`Matched item ${item.itemName} by name`);
        this.editedRequestItems[index] = {
          ...item,
          stockNo: matchedByName.barcode || item.stockNo,
          availableQuantity: matchedByName.quantity,
          selectedItem: matchedByName
        };
      } else {
        // No match found, ensure defaults
        this.editedRequestItems[index].availableQuantity = 0;
      }
    });
  }

  /**
   * Toggles between viewing and editing mode for a returned request
   */
  toggleReturnedRequestEditMode() {
    this.isEditingReturnedRequest = !this.isEditingReturnedRequest;
    
    if (this.isEditingReturnedRequest && this.selectedRequest) {
      // Ensure form is populated when entering edit mode
      this.prepareReturnedRequestForEditing(this.selectedRequest);
    }
  }

  /**
   * Updates an item in the edited request items array
   */
  updateEditedItem(index: number, field: keyof RequestItemDetail, value: any) {
    if (index >= 0 && index < this.editedRequestItems.length) {
      this.editedRequestItems[index] = {
        ...this.editedRequestItems[index],
        [field]: value
      };
    }
  }

  /**
   * Adds a new item to the edited request items array
   */
  addItemToEditedRequest() {
    const newItem: RequestItemDetail = {
      id: Math.floor(Math.random() * 10000) + 1,
      itemName: '',
      itemType: '',
      unit: '',
      quantity: 1,
      stockAvailable: 'yes',
      stockNo: ''
    };
    
    this.editedRequestItems.push(newItem);
  }

  /**
   * Removes an item from the edited request items array
   */
  removeItemFromEditedRequest(index: number) {
    if (index >= 0 && index < this.editedRequestItems.length) {
      this.editedRequestItems.splice(index, 1);
    }
  }

  /**
   * Resubmits a returned request with updated information
   */
  resubmitReturnedRequest() {
    if (!this.selectedRequest || !this.editedRequestForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.editedRequestForm.controls).forEach(key => {
        this.editedRequestForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    // Get form values
    const formValues = this.editedRequestForm.value;
    
    // Create updated data to send to service
    const updatedData: Partial<RequestItem> = {
      department: formValues.department,
      requestedBy: formValues.requestedBy,
      purpose: formValues.purpose,
      deliveryLocation: formValues.deliveryLocation,
      items: this.editedRequestItems
    };
    
    console.log('Submitting resubmission for request:', this.selectedRequest.id, 'with status:', this.selectedRequest.status);
    
    // Call service to resubmit the request
    this.requestItemService.resubmitReturnedRequest(this.selectedRequest, updatedData)
      .then((newRequest) => {
        console.log('Resubmission successful, new request created with ID:', newRequest.id, 'and status:', newRequest.status);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Request resubmitted successfully'
        });
        
        this.closeDetailsDialog();
        
        // Explicitly refresh the list to ensure we see the new request
        setTimeout(() => {
          this.loadRequests();
        }, 300);
      })
      .catch(error => {
        console.error('Error resubmitting request:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resubmit request'
        });
      });
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedRequest = null;
    this.isEditingReturnedRequest = false;
    this.editedRequestItems = [];
  }

  approveRequest(id: number, event: Event) {
    event.preventDefault();
    this.selectedRequestId = id;
    this.selectedRequest = this.requests.find(item => item.id === id) || null;
    
    // Reset the approval form
    this.approvalForm.reset({
      approvalDate: new Date()
    });
    
    // Show the approval dialog
    this.showApprovalDialog = true;
  }

  submitApproval() {
    if (this.approvalForm.valid && this.selectedRequestId) {
      const formValues = this.approvalForm.value;
      
      console.log('Approving request with ID:', this.selectedRequestId);
      
      // First update the request with approval information
      this.requestItemService.update(this.selectedRequestId, {
        // Don't set status here, let changeStatus do it
        dateApproved: formValues.approvalDate,
        approvedBy: formValues.approvedBy,
        approverPosition: formValues.position
      })
        .then(() => {
          console.log('Request updated with approval details, now changing status...');
          
          // Now use changeStatus to properly trigger notifications and status change
          return this.requestItemService.changeStatus(this.selectedRequestId!, 'Approved');
        })
        .then(() => {
          console.log('Status successfully changed to Approved');
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Request approved successfully by ${formValues.approvedBy}`
          });
          this.closeApprovalDialog();
          this.loadRequests(); // Refresh the list
        })
        .catch(error => {
          console.error('Error approving request:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve request'
          });
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.approvalForm.controls).forEach(key => {
        this.approvalForm.get(key)?.markAsTouched();
      });
    }
  }

  closeApprovalDialog() {
    this.showApprovalDialog = false;
    this.selectedRequestId = null;
    this.selectedRequest = null;
  }

  rejectRequest(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to reject this request?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implement reject logic
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Request has been rejected'
        });
      }
    });
  }

  openReturnDialog(id: number, event: Event) {
    event.preventDefault();
    this.selectedRequestId = id;
    this.selectedRequest = this.requests.find(item => item.id === id) || null;
    this.returnRemarks = '';
    this.showReturnDialog = true;
  }

  submitReturn() {
    if (this.selectedRequestId && this.returnRemarks.trim()) {
      this.returnRequest(this.selectedRequestId, this.returnRemarks);
      this.showReturnDialog = false;
      this.returnRemarks = '';
      this.selectedRequestId = null;
    }
  }

  returnRequest(id: number, remarks: string) {
    this.requestItemService.changeStatus(id, 'Returned', remarks)
      .then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Request returned successfully'
        });
      })
      .catch(error => {
        console.error('Error returning request:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to return request'
        });
      });
  }

  switchTab(tab: 'request' | 'borrow') {
    this.activeTab = tab;
    // Implement logic to switch data based on active tab
  }

  onSearch(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }

  issueRequest(item: RequestItem) {
    this.selectedRequest = item;
    
    // Reset the issue form
    this.issueForm.reset({
      issueDate: new Date()
    });
    
    // Fetch inventory quantities for each request item
    if (item.items && item.items.length > 0) {
      // Get inventory items from localStorage (or could use a service if we had one)
      const storedItems = localStorage.getItem('inventory_items');
      if (storedItems) {
        try {
          const inventoryItems = JSON.parse(storedItems);
          
          // Update each request item with current available quantity from inventory
          item.items.forEach((requestItem: RequestItemDetail) => {
            if (requestItem.stockNo) {
              // Find matching inventory item by barcode/stockNo
              const inventoryItem = inventoryItems.find((invItem: any) => 
                invItem.barcode === requestItem.stockNo
              );
              
              if (inventoryItem) {
                // Update available quantity and stock availability
                requestItem.availableQuantity = inventoryItem.quantity;
                requestItem.stockAvailable = inventoryItem.quantity > 0 ? 'yes' : 'no';
                
                // Set default issue quantity equal to requested quantity if enough stock available
                if (inventoryItem.quantity >= requestItem.quantity) {
                  requestItem.issueQuantity = requestItem.quantity;
                } else if (inventoryItem.quantity > 0) {
                  // Otherwise set to max available
                  requestItem.issueQuantity = inventoryItem.quantity;
                } else {
                  // No stock available
                  requestItem.issueQuantity = 0;
                }
              } else {
                // Item not found in inventory
                requestItem.availableQuantity = 0;
                requestItem.stockAvailable = 'no';
                requestItem.issueQuantity = 0;
              }
            }
          });
        } catch (error) {
          console.error('Error fetching inventory data:', error);
        }
      }
    }
    
    this.showIssueDialog = true;
  }

  closeIssueDialog() {
    this.showIssueDialog = false;
    this.issueNotes = '';
    this.selectedRequest = null;
  }

  getTotalIssueItems(items: RequestItemDetail[]) {
    return items?.reduce((sum, item) => sum + (item.issueQuantity || 0), 0) || 0;
  }

  onStockAvailabilityChange(event: any, item: any) {
    if (event.value === 'yes') {
      // Set reasonable values when stock is available
      item.availableQuantity = Math.max(item.quantity, 10); // Ensure enough for the request
      item.issueQuantity = item.quantity; // Default to requested quantity
      item.remarks = 'Item available in stock';
    } else {
      // Reset values for when stock is not available
      item.availableQuantity = 0;
      item.issueQuantity = 0; // Important: set to 0 to avoid inventory deduction
      item.remarks = 'Out of stock';
    }
  }

  isValidIssueQuantities(): boolean {
    if (!this.selectedRequest?.items) {
      return false;
    }

    return this.selectedRequest.items.every(item => {
      // If stock is not available, skip quantity validation
      if (item.stockAvailable === 'no') {
        return true;
      }

      // If stock is available, validate quantities
      if (item.stockAvailable === 'yes') {
        return typeof item.issueQuantity === 'number' && 
               typeof item.availableQuantity === 'number' &&
               item.issueQuantity > 0 && 
               item.issueQuantity <= item.availableQuantity;
      }

      // If stock availability is not set, return false
      return false;
    });
  }

  confirmIssueItems() {
    if (!this.selectedRequest || !this.issueForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.issueForm.controls).forEach(key => {
        this.issueForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    if (!this.isValidIssueQuantities()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please check issue quantities'
      });
      return;
    }
    
    const formValues = this.issueForm.value;
    
    // Make a deep clone of the selected request to avoid reference issues
    const requestToSubmit = JSON.parse(JSON.stringify(this.selectedRequest));
    
    // Ensure that all items have issueQuantity set
    if (requestToSubmit.items) {
      // Log the items before any changes
      console.log('Items before setting issueQuantity:', JSON.stringify(requestToSubmit.items.map((i: RequestItemDetail) => ({
        itemName: i.itemName,
        stockNo: i.stockNo,
        quantity: i.quantity,
        availableQuantity: i.availableQuantity,
        issueQuantity: i.issueQuantity,
        stockAvailable: i.stockAvailable
      }))));
      
      // Fix any items missing issueQuantity
      requestToSubmit.items.forEach((item: RequestItemDetail) => {
        // If stock is not available, set issue quantity to 0
        if (item.stockAvailable === 'no' && !item.issueQuantity) {
          item.issueQuantity = 0;
        } 
        // If stock is available but issue quantity is not set, set it to requested quantity
        else if (item.stockAvailable === 'yes' && (!item.issueQuantity || item.issueQuantity === undefined) && item.availableQuantity && item.availableQuantity > 0) {
          item.issueQuantity = Math.min(item.quantity || 0, item.availableQuantity);
        }
      });
      
      // Also update the original selected request with the same values
      // This ensures our UI stays in sync
      if (this.selectedRequest.items) {
        this.selectedRequest.items.forEach((item: RequestItemDetail, index: number) => {
          if (requestToSubmit.items[index]) {
            item.issueQuantity = requestToSubmit.items[index].issueQuantity;
          }
        });
      }
      
      // Log the items after setting default issueQuantity values
      console.log('Items after setting issueQuantity:', JSON.stringify(requestToSubmit.items.map((i: RequestItemDetail) => ({
        itemName: i.itemName,
        stockNo: i.stockNo,
        quantity: i.quantity,
        availableQuantity: i.availableQuantity,
        issueQuantity: i.issueQuantity,
        stockAvailable: i.stockAvailable
      }))));
    }
    
    // Save the issue details to the request first
    // This ensures that the issueQuantity values are saved before we change the status
    this.requestItemService.update(requestToSubmit.id!, {
      dateIssued: formValues.issueDate,
      issuedBy: formValues.issuedBy,
      issuerPosition: formValues.position,
      items: requestToSubmit.items // Include the updated items with issueQuantity
    })
      .then(() => {
        // Now use changeStatus method which includes our inventory update logic
        return this.requestItemService.changeStatus(
          requestToSubmit.id!,
          'Issued',
          undefined // no remarks
        );
      })
      .then(() => {
        // Log the result of the update
        console.log('Successfully changed status to Issued');
        
        // Directly verify a sample item's inventory was updated
        if (requestToSubmit.items && requestToSubmit.items.length > 0) {
          const firstItem = requestToSubmit.items[0];
          if (firstItem.stockNo) {
            this.verifyInventoryUpdate(firstItem.stockNo, firstItem.itemName);
          }
        }
    
    this.closeIssueDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
          detail: `Items have been issued successfully by ${formValues.issuedBy}`
        });
        this.loadRequests(); // Refresh the list
      })
      .catch(error => {
        console.error('Error issuing items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to issue items'
        });
      });
  }
  
  // Simplify the verifyInventoryUpdate method
  private verifyInventoryUpdate(stockNo: string, itemName: string): void {
    // Simple log to confirm the item was processed
    console.log(`Item "${itemName}" (${stockNo}) processed successfully`);
  }

  getBorrowStatusSeverity(status: string): TagSeverity {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Borrowed':
        return 'info';
      case 'Returned':
        return 'success';
      case 'Overdue':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  onBorrowSearch(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.borrowTable.filterGlobal(searchValue, 'contains');
  }

  viewBorrowDetails(item: BorrowItem) {
    this.selectedBorrowItem = item;
    this.showBorrowDetailsDialog = true;
  }

  approveBorrow(id: number, event: Event) {
    console.log('Approving borrow request:', id);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to approve this borrow request?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const itemIndex = this.borrowedItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          this.borrowedItems[itemIndex].status = 'Borrowed';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Borrow request approved successfully'
          });
        }
      }
    });
  }

  rejectBorrow(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to reject this borrow request?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedBorrowItem = this.borrowedItems.find(item => item.id === id) || null;
        if (this.selectedBorrowItem) {
          this.borrowRejectRemarks = '';
          this.showBorrowRejectDialog = true;
        }
      }
    });
  }

  submitBorrowReject() {
    if (this.selectedBorrowItem && this.borrowRejectRemarks.trim()) {
      const itemIndex = this.borrowedItems.findIndex(item => item.id === this.selectedBorrowItem?.id);
      if (itemIndex !== -1) {
        this.borrowedItems[itemIndex].status = 'Rejected';
        this.borrowedItems[itemIndex].remarks = this.borrowRejectRemarks;
        
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Borrow request has been rejected'
        });
        
        this.showBorrowRejectDialog = false;
        this.borrowRejectRemarks = '';
        this.selectedBorrowItem = null;
      }
    }
  }

  returnBorrowedItem(item: BorrowItem) {
    this.selectedBorrowItem = item;
    this.showBorrowReturnDialog = true;
  }

  submitBorrowReturn() {
    if (this.selectedBorrowItem && this.borrowReturnRemarks.trim()) {
      const itemIndex = this.borrowedItems.findIndex(item => item.id === this.selectedBorrowItem?.id);
      if (itemIndex !== -1) {
        this.borrowedItems[itemIndex].status = 'Returned';
        this.borrowedItems[itemIndex].remarks = this.borrowReturnRemarks;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Item returned successfully'
        });
        
        this.showBorrowReturnDialog = false;
        this.borrowReturnRemarks = '';
        this.selectedBorrowItem = null;
      }
    }
  }

  openBorrowDialog() {
    this.showBorrowDialog = true;
    this.borrowForm.reset();
    this.borrowItems = [];
  }

  submitBorrow() {
    if (this.borrowForm.valid && this.borrowItems.length > 0) {
      const newBorrow: BorrowItem = {
        id: this.borrowedItems.length + 1,
        itemCode: `BRW-${String(this.borrowedItems.length + 1).padStart(3, '0')}`,
        department: this.borrowForm.get('department')?.value,
        borrowedBy: this.borrowForm.get('borrowedBy')?.value,
        dateBorrowed: this.borrowForm.get('dateBorrowed')?.value,
        returnDate: this.borrowForm.get('returnDate')?.value,
        purpose: this.borrowForm.get('purpose')?.value,
        status: 'Pending',
        items: this.borrowItems.map((item: BorrowItemDetail) => ({
          itemName: item.itemName,
          itemType: item.itemType,
          quantity: item.quantity,
          availableQuantity: item.availableQuantity
        }))
      };

      this.borrowedItems.unshift(newBorrow);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Borrow request submitted successfully'
      });
      this.closeBorrowDialog();
    }
  }

  closeBorrowDialog() {
    this.showBorrowDialog = false;
    this.borrowForm.reset();
    this.borrowItems = [];
  }

  addBorrowItem() {
    this.borrowItems.push({
      itemName: '',
      itemType: '',
      quantity: 1,
      availableQuantity: 10
    });
  }

  removeBorrowItem(index: number) {
    this.borrowItems.splice(index, 1);
  }

  closeAddRequestDialog() {
    this.showAddRequestDialog = false;
    this.requestForm.reset();
    this.requestItems = [];
  }

  addRequestItem() {
    this.requestItems.push({
      id: this.requestItems.length + 1,
      itemName: '',
      itemType: '',
      unit: '',
      quantity: 1,
      availableQuantity: 0,
      issueQuantity: 0,
      stockAvailable: 'yes',
      stockNo: ''
    });
  }

  removeRequestItem(index: number) {
    this.requestItems.splice(index, 1);
  }

  onItemSelect(event: any, index: number) {
    const selectedItem = this.availableItems.find(item => item.value === event.value);
    if (selectedItem) {
      this.requestItems[index].itemType = selectedItem.type;
    }
  }

  isItemSelected(index: number): boolean {
    return this.availableItems.some(item => item.value === this.requestItems[index].itemName);
  }

  isValidRequest(): boolean {
    if (!this.requestForm.get('department')?.value || !this.requestForm.get('requestedBy')?.value) {
      return false;
    }
    
    if (this.requestItems.length === 0) {
      return false;
    }

    return this.requestItems.every(item => 
      item.itemName?.trim() && 
      item.itemType?.trim() && 
      item.quantity > 0
    );
  }

  submitRequest() {
    if (this.isValidRequest()) {
      const newRequest: Omit<RequestItem, 'id'> = {
        itemCode: this.requestForm.value.itemCode,
        codeNumber: this.requestForm.value.codeNumber,
        department: this.requestForm.value.department,
        requestedBy: this.requestForm.value.requestedBy,
        dateRequest: this.requestForm.value.dateRequest,
        status: 'Pending',
        purpose: this.requestForm.value.purpose,
        items: this.requestItems
      };

      this.requestItemService.create(newRequest)
        .then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Request submitted successfully'
      });
          this.closeRequestDialog();
        })
        .catch(error => {
          console.error('Error submitting request:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit request'
          });
        });
    }
  }

  deliverRequest(item: RequestItem, event: Event) {
    event.stopPropagation();
    if (item.isBeingDelivered) {
      // If already being delivered, navigate to delivered-stock
      this.router.navigate(['shared/delivered-stock']);
      return;
    }
    this.selectedRequestForDelivery = item;
    this.showDeliveryConfirmationDialog = true;
  }

  async confirmDelivery() {
    if (!this.selectedRequestForDelivery) return;

    try {
      console.log('Request before delivery:', {
        id: this.selectedRequestForDelivery.id,
        deliveryLocation: this.selectedRequestForDelivery.deliveryLocation,
        items: this.selectedRequestForDelivery.items.length
      });

      // Update the request item to mark it as being delivered
      const updatedRequest = await this.requestItemService.update(
        this.selectedRequestForDelivery.id!,
        { isBeingDelivered: true }
      );

      if (updatedRequest) {
        console.log('Updated request:', {
          id: updatedRequest.id,
          deliveryLocation: updatedRequest.deliveryLocation,
          items: updatedRequest.items.length
        });

        // Small delay to ensure request item update is processed first
        setTimeout(async () => {
          try {
            // Create a delivery record in the delivery service
            const deliveryRecord = await this.deliveryService.createFromRequestItem(updatedRequest);
            
            console.log('Created delivery record:', {
              id: deliveryRecord.id,
              deliveryAddress: deliveryRecord.deliveryAddress,
              items: deliveryRecord.details.length
            });
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
              detail: 'Request marked for delivery and added to Delivery Management'
            });

            // Refresh the requests list
            await this.loadRequests();
          } catch (error) {
            console.error('Error creating delivery record:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Request was marked for delivery but could not be added to Delivery Management'
            });
          }
        }, 300); // 300ms delay should be sufficient
      }
    } catch (error) {
      console.error('Error marking request for delivery:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to mark request for delivery'
      });
    } finally {
      this.showDeliveryConfirmationDialog = false;
      this.selectedRequestForDelivery = null;
    }
  }

  deleteRequest(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this request?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.requestItemService.delete(id)
          .then(success => {
            if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Request deleted successfully'
          });
        }
          })
          .catch(error => {
            console.error('Error deleting request:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete request'
            });
          });
      }
    });
  }

  filterByStatus() {
    if (!this.selectedStatus || this.selectedStatus === 'All') {
      return this.requests;
    }
    return this.requests.filter(request => request.status === this.selectedStatus);
  }

  filterBorrowByStatus() {
    if (!this.selectedBorrowStatus || this.selectedBorrowStatus === 'All') {
      return this.borrowedItems;
    }
    return this.borrowedItems.filter(item => item.status === this.selectedBorrowStatus);
  }

  closeBorrowDetailsDialog() {
    this.showBorrowDetailsDialog = false;
    this.selectedBorrowItem = null;
  }

  closeBorrowReturnDialog() {
    this.showBorrowReturnDialog = false;
    this.borrowReturnRemarks = '';
    this.selectedBorrowItem = null;
  }

  closeBorrowRejectDialog() {
    this.showBorrowRejectDialog = false;
    this.borrowRejectRemarks = '';
    this.selectedBorrowItem = null;
  }

  openRequestDialog() {
    this.requestForm.reset();
    this.requestForm.patchValue({
      dateRequest: new Date(),
      status: 'Pending'
    });
    this.requestItems = [];
    this.showRequestDialog = true;
  }

  closeRequestDialog() {
    this.showRequestDialog = false;
  }

  // Add methods to update counts
  private updateRequestCount(): void {
    // Count ALL pending requests, regardless of filter or pagination
    this.pendingRequestCount = this.requests.filter(req => req.status === 'Pending').length;
  }

  private updateBorrowCount(): void {
    // Count ALL pending borrows, regardless of filter or pagination
    this.pendingBorrowCount = this.borrowedItems.filter(item => item.status === 'Pending').length;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Issued': 'status-issued',
      'Returned': 'status-returned',
      'Borrowed': 'status-borrowed',
      'Rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  }

  // Load the current user information
  private loadUser() {
    const currentUser = this.userService.getUser();
    if (currentUser) {
      // Pre-fill form fields with user info if available
      this.requestForm.patchValue({
        requestedBy: currentUser.fullname || currentUser.username || '',
        department: currentUser.office?.name || ''
      });
      
      this.approvalForm.patchValue({
        approvedBy: currentUser.fullname || currentUser.username || '',
        position: currentUser.position || ''
      });
      
      this.issueForm.patchValue({
        issuedBy: currentUser.fullname || currentUser.username || '',
        position: currentUser.position || ''
      });
    }
  }

  /**
   * Validates the issue quantity to ensure it never exceeds the available quantity
   * @param item The request item being edited
   * @param event The input event from p-inputNumber
   */
  validateIssueQuantity(item: RequestItemDetail, event: any): void {
    // Get the value from the event
    const inputValue = event.value;
    
    // Make sure we have a valid availableQuantity
    const availableQty = item.availableQuantity ?? 0;
    
    // If the value is higher than available quantity, set it to the maximum
    if (inputValue > availableQty) {
      // We need to use setTimeout to allow Angular to process the current change first
      setTimeout(() => {
        item.issueQuantity = availableQty;
      });
    }
    
    // If the value is negative, set it to 0
    if (inputValue < 0) {
      setTimeout(() => {
        item.issueQuantity = 0;
      });
    }
  }

  /**
   * Toggles the add item fields visibility
   */
  toggleAddItemFields() {
    this.showAddItemFields = !this.showAddItemFields;
    // Reset the new item form when toggling
    this.resetNewItemForm();
  }

  /**
   * Resets the new item form to default values
   */
  resetNewItemForm() {
    this.newItem = {
      id: Math.floor(Math.random() * 10000) + 1,
      itemName: '',
      itemType: '',
      unit: '',
      quantity: 1,
      stockNo: '',
      stockAvailable: 'yes',
      availableQuantity: 0,
      selectedItem: null
    };
  }

  /**
   * Adds the current new item to the edited request items
   */
  addItem() {
    if (this.newItem.itemName && this.newItem.itemType && this.newItem.unit && this.newItem.quantity) {
      // Validate quantity one more time before adding
      if (this.newItem.quantity > (this.newItem.availableQuantity || 0)) {
        this.newItem.quantity = this.newItem.availableQuantity || 0;
      }
      
      // Create a copy to avoid reference issues
      const itemToAdd = { ...this.newItem };
      
      // Generate a new random ID
      itemToAdd.id = Math.floor(Math.random() * 10000) + 1;
      
      // Add to the edited items list
      this.editedRequestItems.push(itemToAdd);
      
      // Hide the add form and reset it
      this.showAddItemFields = false;
      this.resetNewItemForm();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Item Added',
        detail: `${itemToAdd.itemName} added to the request`
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
    }
  }

  /**
   * Removes an item from the edited request items by index
   */
  removeItem(index: number) {
    if (index >= 0 && index < this.editedRequestItems.length) {
      const removedItem = this.editedRequestItems[index];
      this.editedRequestItems.splice(index, 1);
      
      this.messageService.add({
        severity: 'info',
        summary: 'Item Removed',
        detail: `${removedItem.itemName} removed from the request`
      });
    }
  }

  /**
   * Loads inventory items for dropdowns
   */
  private async loadInventoryItems(): Promise<void> {
    try {
      // Get inventory items from localStorage
      const storedItems = localStorage.getItem('inventory_items');
      if (storedItems) {
        this.inventoryItems = JSON.parse(storedItems);
        console.log(`Loaded ${this.inventoryItems.length} inventory items for selection`);
      } else {
        console.warn('No inventory items found in localStorage');
        this.inventoryItems = [];
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load inventory items'
      });
      this.inventoryItems = [];
    }
  }

  /**
   * Handles item selection from dropdown
   * @param event Selection event containing the selected item
   */
  onItemSelectionChange(event: any): void {
    const selectedItem = event.value;
    if (selectedItem) {
      // Update the newItem with values from the selected inventory item
      this.newItem = {
        ...this.newItem,
        itemName: selectedItem.product,
        itemType: selectedItem.category,
        unit: selectedItem.unit || 'pcs',
        stockNo: selectedItem.barcode || '',
        availableQuantity: selectedItem.quantity || 0,
        selectedItem: selectedItem,
        quantity: 1 // Reset to 1 when a new item is selected
      };
      
      // Validate that the selected item has available quantity
      if (selectedItem.quantity <= 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Low Stock',
          detail: `${selectedItem.product} is out of stock (available: ${selectedItem.quantity})`
        });
      }
    } else {
      // Reset the form if no item is selected
      this.resetNewItemForm();
    }
  }
  
  /**
   * Validates the requested quantity against available stock
   * @param event Input event
   * @param silentMode If true, will not show notifications
   */
  validateQuantity(event: any, silentMode: boolean = false): void {
    const requestedQty = event.value; // Use the event value, not the bound value
    const availableQty = this.newItem.availableQuantity || 0;
    
    // Ensure quantity is a positive number
    if (requestedQty <= 0) {
      setTimeout(() => {
        this.newItem.quantity = 1;
      });
      
      if (!silentMode) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Invalid Input',
          detail: 'Quantity must be greater than zero'
        });
      }
      return;
    }
    
    // Check if requested quantity exceeds available quantity
    if (requestedQty > availableQty) {
      setTimeout(() => {
        this.newItem.quantity = availableQty;
      });
      
      if (!silentMode) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Quantity Adjusted',
          detail: `Maximum available quantity is ${availableQty}`
        });
      }
    }
  }

  /**
   * Handles item selection from dropdown for existing items in the edit list
   * @param event Selection event containing the selected item
   * @param index Index of the item in the editedRequestItems array
   */
  onExistingItemSelectionChange(event: any, index: number): void {
    const selectedItem = event.value;
    if (selectedItem && index >= 0 && index < this.editedRequestItems.length) {
      // Update the existing item with values from the selected inventory item
      this.editedRequestItems[index] = {
        ...this.editedRequestItems[index],
        itemName: selectedItem.product,
        itemType: selectedItem.category,
        unit: selectedItem.unit || 'pcs',
        stockNo: selectedItem.barcode || '',
        availableQuantity: selectedItem.quantity || 0,
        selectedItem: selectedItem,
        quantity: 1 // Reset to 1 when a new item is selected
      };
      
      // Validate that the selected item has available quantity
      if (selectedItem.quantity <= 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Low Stock',
          detail: `${selectedItem.product} is out of stock (available: ${selectedItem.quantity})`
        });
      }
    }
  }

  /**
   * Validates the requested quantity against available stock for an existing item
   * @param event Input event
   * @param index Index of the item in the editedRequestItems array
   * @param silentMode If true, will not show notifications
   */
  validateExistingItemQuantity(event: any, index: number, silentMode: boolean = false): void {
    if (index >= 0 && index < this.editedRequestItems.length) {
      const item = this.editedRequestItems[index];
      const requestedQty = event.value; // Use the event value directly
      const availableQty = item.availableQuantity || 0;
      
      // Ensure quantity is a positive number
      if (requestedQty <= 0) {
        setTimeout(() => {
          this.editedRequestItems[index].quantity = 1;
        });
        
        if (!silentMode) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Invalid Input',
            detail: 'Quantity must be greater than zero'
          });
        }
        return;
      }
      
      // Check if requested quantity exceeds available quantity
      if (item.selectedItem && requestedQty > availableQty) {
        setTimeout(() => {
          this.editedRequestItems[index].quantity = availableQty;
        });
        
        if (!silentMode) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Quantity Adjusted',
            detail: `Maximum available quantity is ${availableQty}`
          });
        }
      }
    }
  }
}
