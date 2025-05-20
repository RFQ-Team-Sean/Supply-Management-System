import { Component, OnInit, AfterViewInit, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { ImageModule } from 'primeng/image';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PurchaseRequestService } from 'src/app/services/purchase-request.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalendarModule } from 'primeng/calendar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Approver, Office, PPMPItem, PPMPProject, PurchaseRequest, VendorInfo, Users, Approvals, Notification } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { VendorInfoData } from 'src/app/schema/dummy';
import { FileUploadModule } from 'primeng/fileupload';
import { SignatureModalComponent, SignatureModalData } from 'src/app/components/signature-modal/signature-modal.component';
import { User, UserService } from 'src/app/services/user.service';
import { firstValueFrom } from 'rxjs';

interface PurchaseRequestExtended extends PurchaseRequest {
  items: PPMPItem[];
  requisitioningOffice: string;
  purpose: string;
  totalAmount: number;
  requestedBy: { name: string, designation: string };
  vendor?: VendorInfo;
  // Added SAI and ALOBS information
  sai?: {
    no: number;
    date: Date;
  };
  alobs?: {
    no: number;
    date: Date;
  };
  coaInfo: {
    annexNo: string;
    circularNo: string;
  };
}

interface ApproverExtended extends Approver  { 
  approver: string, 
  signature?:string,
  approval_id?:string 
}

@Component({
  selector: 'app-purchase-request',
  templateUrl: './purchase-request.component.html',
  styleUrls: ['./purchase-request.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    RouterModule,
    TableModule,
    CalendarModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TabViewModule,
    ImageModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule,
    ButtonGroupModule,
    TextareaModule,
    FileUploadModule,
    SignatureModalComponent,
  ],
  providers: [MessageService, ConfirmationService, PurchaseRequestService]
})
export class PurchaseRequestComponent implements OnInit, AfterViewInit, AfterViewChecked {
  [x: string]: any;
  
  // Basic properties
  displayModal = false;
  searchQuery = '';
  selectedDepartment: string | null = null;
  activeTabIndex = 0;
  saiDate: Date = new Date();
  alobsDate: Date = new Date();
  isEditMode = false;
  activeTabHeader = 'Pending Requests';
  tabHeaders = ['Pending Requests', 'Validated Requests', 'Rejected Requests'];
  
  // Main request object
  currentRequest!:PurchaseRequestExtended
  
  // Item management
  editingItem: PPMPItem | null = null;
  itemDialogVisible = false;
  
  // Vendor and signature management
  vendorList = VendorInfoData;

  // Data collections
  allPr: PurchaseRequestExtended[] = [];
  filteredPr: any[] = [];
  pendingRequests: any[] = [];
  validatedRequests: any[] = [];
  rejectedRequests: any[] = [];

  // Other data
  departments = [
    { name: 'Department 1', value: 'Department 1' },
    { name: 'Department 2', value: 'Department 2' },
    { name: 'Department 3', value: 'Department 3' },
  ];

  approvers:ApproverExtended[] = [];
  
  // Pagination variables
  pageSize = 297; // A4 height in mm
  pageWidth = 210; // A4 width in mm
  rowsPerPage = 10; // Estimated number of rows per page

  // Loading state
  loading: boolean = false;

  // State tracking for edit mode and pagination
  private _lastEditMode: boolean = false;
  private _isUpdatingPagination: boolean = false;
  private _paginationSnapshot: {
    content: string | null,
    pageCount: number,
    editMode: boolean
  } = {
    content: null,
    pageCount: 0,
    editMode: false
  };

  user?:User;

  currentPrID?:string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService,
    private userService:UserService,
  ) {}
  
  async ngOnInit() {
    this.loading = true;
    try {
      this.user = this.userService.getUser();
      const params = await firstValueFrom(this.activatedRoute.queryParams);
      this.currentPrID = params['id'];
      await this.loadData();
      this.loading = false;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to initialize component'
      });
    }
   
  }

  ngAfterViewChecked() {
    // Only run pagination if edit mode changed to prevent continuous updates
    if (this._lastEditMode !== this.isEditMode && !this._isUpdatingPagination) {
      this._lastEditMode = this.isEditMode;
      
      // Take a snapshot before changing edit mode
      if (this.isEditMode) {
        this.takePaginationSnapshot();
      }
      
      // Schedule pagination update to avoid ExpressionChangedAfterItHasBeenChecked error
      setTimeout(() => this.managePagination(), 200);
    }
  }

  ngAfterViewInit() {
    console.log('Component state:', {
      isEditMode: this.isEditMode,
      loading: this.loading,
      hasCurrentRequest: !!this.currentRequest,
      pendingRequests: this.pendingRequests.length
    });
    
    // Force a complete UI refresh
    setTimeout(() => {
      this.loading = false;
      this.isEditMode = false;  // Try toggling this to see if UI changes
      console.log('State updated');
    }, 1000);
  }

  /**
   * Takes a snapshot of the current pagination state before changes
   */
  private takePaginationSnapshot() {
    const container = document.querySelector('.a4-container');
    if (!container) return;
    
    const pages = container.querySelectorAll('.a4-page');
    
    this._paginationSnapshot = {
      content: container.innerHTML,
      pageCount: pages.length,
      editMode: this.isEditMode
    };
  }

  /**
   * Restores pagination from a snapshot if needed
   */
  private restorePaginationSnapshot() {
    // Only restore if we have a valid snapshot
    if (!this._paginationSnapshot.content || this._paginationSnapshot.editMode === this.isEditMode) {
      return false;
    }
    
    const container = document.querySelector('.a4-container');
    if (!container) return false;
    
    // Set flag to prevent recursive calls during update
    this._isUpdatingPagination = true;
    
    // Restore container content
    container.innerHTML = this._paginationSnapshot.content;
    
    // Update page numbers
    this.updatePageNumbers(container);
    
    this._isUpdatingPagination = false;
    return true;
  }

  /**
   * Load and prepare all data needed for the component
   */
  private async loadData() {
    try {      
      const [users,approvers,prs,items,offices,approvals] = await this.crudService.forJoin(
        Users,Approver,PurchaseRequest,PPMPItem,Office,Approvals
      )

      const projects = await this.crudService.joined({
        'PPMPProject': {
          'PPMP':true,
        }
      })
      
      this.allPr = prs.filter(pr => {
        const project = projects.find(p => p.id == pr.project_id )
        const office = offices.find(o => o.id == project?.PPMP?.office_id)
        const user = users.find(u => u.id == pr.user_id);
        return user && office
      }).map(pr => {
        const project = projects.find(p => p.id == pr.project_id)!
        const office = offices.find(o => o.id == project?.PPMP?.office_id)!
        const itemz = items.filter(i => i.ppmp_project_id == pr.project_id)!
        const user = users.find(u => u.id == pr.user_id)!;
        return {
          ...pr,
          items: itemz,
          requisitioningOffice: office?.name,
          purpose: project.project_description || 'For official use',
          totalAmount: itemz.reduce((acc, item) => acc + (item.quantity_required * item.estimated_unit_cost), 0),
          requestedBy: { name: user.fullname, designation: user.position ?? 'BUCS Faculty III' },
          coaInfo: {
            annexNo: 'Annex G-6',
            circularNo: 'COA Circular No. 2001-04, S. 2001'
          },
          alobs: {
            no: 12,
            date: new Date()
          },
          sai: {
            no: 12,
            date: new Date()
          }
        }
      });
      const foundRequest = this.allPr.find(pr => pr.id === this.currentPrID);
      if (foundRequest) {
        this.currentRequest = foundRequest;
        this.computeTotalAmount();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Purchase request not found'
        });
      }
      this.approvers = approvers
        .filter(a => a.entity_id == '2' && users.find(u => u.id == a.user_id))
        .sort((a, b) => a.approval_order - b.approval_order)
        .map(a => {
          const user = users.find(u => u.id == a.user_id)!
          const approved = approvals.find(ap=>ap.approver_id == a.id && this.currentRequest.id == ap.document_id);
          return {
            ...a,
            approver: user.fullname,
            signature:approved?.signature,
            approval_id: approved?.id,
          }
        })
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
  



  /**
   * Compute total cost for each item
   */
  computeItemTotalCost(): void {
    if (this.currentRequest?.items) {
      this.currentRequest.items.forEach(item => {
        item.estimated_total_cost = item.quantity_required * item.estimated_unit_cost;
      });
    }
  }
  
  /**
   * Compute total amount for all items
   */
  private computeTotalAmount(): void {
    if (this.currentRequest?.items) {
      this.computeItemTotalCost(); // Ensure item costs are updated first
      this.currentRequest.totalAmount = this.currentRequest.items.reduce((sum, item) => 
        sum + item.estimated_total_cost, 0);
    }
  }
  
  /**
   * Handle quantity or cost change events
   */
  onQuantityOrCostChange() {
    this.computeTotalAmount();
    
    // Debounce pagination updates to avoid excessive calculations
    if (this._quantityChangedTimeout) {
      clearTimeout(this._quantityChangedTimeout);
    }
    
    this._quantityChangedTimeout = setTimeout(() => {
      this.managePagination();
    }, 300);
  }

  private _quantityChangedTimeout: any = null;


  /**
   * Approve a purchase request
   */
  async approve() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve this purchase request?',
      accept: async () => {
        try {
          // Extract the PR ID and create data object for the update
          const prId = this.currentRequest.id;
          const updateData = {
            prNo: this.currentRequest.prNo,
            project_id: this.currentRequest.project_id,
            user_id: this.currentRequest.user_id,
            office_id: this.currentRequest.office_id,
            current_approver_level: this.currentRequest.current_approver_level,
            request_date: this.currentRequest.request_date,
            status: 'Approved' as 'Draft' | 'Pending' | 'Approved',
            vendor: this.currentRequest.vendor,
            sai: this.currentRequest.sai,
            alobs: this.currentRequest.alobs,
            signature: this.currentRequest.signature
          };
          
          // Update the PR with the new status
          await this.crudService.update(PurchaseRequest, prId, updateData);
          
          this.currentRequest.status = 'Approved';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Purchase request approved'
          });
          await this.refreshData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve purchase request'
          });
        }
      }
    });
  }

  /**
   * Reject a purchase request
   */
  async reject() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reject this purchase request?',
      accept: async () => {
        try {
          // Extract the PR ID and create data object for the update
          const prId = this.currentRequest.id;
          const updateData = {
            prNo: this.currentRequest.prNo,
            project_id: this.currentRequest.project_id,
            user_id: this.currentRequest.user_id,
            office_id: this.currentRequest.office_id,
            current_approver_level: this.currentRequest.current_approver_level,
            request_date: this.currentRequest.request_date,
            status: 'Draft' as 'Draft' | 'Pending' | 'Approved',
            vendor: this.currentRequest.vendor,
            sai: this.currentRequest.sai,
            alobs: this.currentRequest.alobs
          };
          
          // Update the PR with the new status
          await this.crudService.update(PurchaseRequest, prId, updateData);
          
          this.currentRequest.status = 'Draft';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Purchase request rejected'
          });
          await this.refreshData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reject purchase request'
          });
        }
      }
    });
  }

  /**
/**
 * Toggle edit mode
 */
toggleEditMode() {
  // If we're already in edit mode, we're about to save changes
  if (this.isEditMode) {
    // Save changes and let the saveChanges method handle the UI updates
    this.saveChanges();
    return;
  }
  
  // Take a snapshot of the current state before entering edit mode
  this.takePaginationSnapshot();
  
  // Set edit mode flag
  this.isEditMode = true;
  this._lastEditMode = true;
  
  // Add 'editing' class to the host element
  const hostElement = document.querySelector('app-purchase-request');
  if (hostElement) {
    hostElement.classList.add('editing');
  }
  
  // Initialize coaInfo if entering edit mode and it doesn't exist
  if (!this.currentRequest.coaInfo) {
    this.currentRequest.coaInfo = {
      annexNo: 'Annex G-6',
      circularNo: 'COA Circular No. 2001-04, S. 2001'
    };
  }
  
  // Initialize vendor info if it doesn't exist
  if (!this.currentRequest.vendor) {
    this.currentRequest.vendor = {
      id:'',
      companyName: '',
      address: '',
      tin: '',
      telFax: '',
      email: ''
    };
  }
  
  // Apply edit mode styling with slight delay to ensure DOM is ready
  setTimeout(() => {
    this.createEditModeView();
  }, 100);
}
  
  /**
   * Create a special view for edit mode that preserves data but simplifies layout
   */
  private createEditModeView() {
    const container = document.querySelector('.a4-container');
    if (!container) return;
    
    // Add a class to indicate edit mode
    container.classList.add('edit-mode-container');
    
    // Add an edit mode banner at the top if it doesn't exist
    if (!document.querySelector('.edit-mode-banner')) {
      const banner = document.createElement('div');
      banner.className = 'edit-mode-banner';
      banner.innerHTML = `
        <div style="background-color: #fff3cd; color: #856404; padding: 8px; text-align: center; margin-bottom: 10px; border-radius: 4px;">
          <strong>EDIT MODE</strong> - Content will be properly paginated when saved
        </div>
      `;
      
      const prContainer = document.querySelector('.pr-container');
      if (prContainer) {
        prContainer.insertBefore(banner, prContainer.firstChild);
      }
    }
    
    // No need to completely restructure the content in edit mode
    // We'll rely on CSS to handle different styling in edit mode
  }

isSigning:boolean = false;

toggleSign(){
  this.isSigning = !this.isSigning;
  if(this.isSigning){
    this.messageService.add({
      severity: 'warn',
      summary: 'For Signature',
      detail: this.currentRequest.current_approver_level == 0 ? 'Please sign the document to finalize this request.' : 'Please sign the document to approve this request.'
    });
  }
}
/**
 * Save changes to the purchase request
 */
async saveChanges() {
  try {
    this.loading = true; // Add loading indicator while saving
    this.computeTotalAmount(); // Recalculate totals before saving
    
    // Extract the PR ID and create data object for the update
    const prId = this.currentRequest.id;
    const updateData = {
      current_approver_level: this.currentRequest.current_approver_level,
      status: this.currentRequest.status as 'Draft' | 'Pending' | 'Approved',
      signature: this.currentRequest.signature
    };
    
    // Update the PR with the new data
    await this.crudService.partial_update(PurchaseRequest, prId, updateData);
    
    // Remove the edit mode banner
    const banner = document.querySelector('.edit-mode-banner');
    if (banner) {
      banner.remove();
    }
    
    // Remove edit mode class from container
    const container = document.querySelector('.a4-container');
    if (container) {
      container.classList.remove('edit-mode-container');
    }
    
    // Update data from database to ensure we have the latest version
    await this.refreshData();
    
    // Force a complete re-render of the component view
    this.isEditMode = false;
    this._lastEditMode = false;
    
    // Remove 'editing' class from the host element
    const hostElement = document.querySelector('app-purchase-request');
    if (hostElement) {
      hostElement.classList.remove('editing');
    }
    
    // Wait for Angular change detection to complete
    setTimeout(() => {
      // Update pagination after saving
      this.managePagination();
      
      // Show success message at the end of the process
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Changes saved successfully'
      });
      
      this.loading = false;
    }, 500);
  } catch (error) {
    this.loading = false;
    console.error('Error saving changes:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save changes'
    });
  }
}

  currentApprover(){
    const approver = this.approvers.find(a=>a.user_id == this.user?.id && this.currentRequest.current_approver_level == a.approval_order);
    return approver;
  }
  
  /**
   * Add a new item to the purchase request
   */
  addNewItem() {
    this.editingItem = {
      id: `ITEM-${Date.now()}`,
      ppmp_project_id: this.currentRequest.project_id,
      quantity_required: 1,
      unit_of_measurement: 'unit',
      estimated_unit_cost: 0,
      estimated_total_cost: 0,
      classification: 'goods',
      technical_specification: ''
    };
    this.itemDialogVisible = true;
  }
  
  /**
   * Edit an existing item
   */
  editItem(item: PPMPItem) {
    this.editingItem = {...item};
    this.itemDialogVisible = true;
  }
  
  /**
   * Save item changes
   */
  saveItem() {
    if (!this.editingItem) return;
    
    // Calculate total cost
    this.editingItem.estimated_total_cost = 
      this.editingItem.quantity_required * this.editingItem.estimated_unit_cost;
    
    // If it's a new item, add it to the array
    const existingIndex = this.currentRequest.items.findIndex(i => i.id === this.editingItem!.id);
    if (existingIndex === -1) {
      this.currentRequest.items.push(this.editingItem);
    } else {
      // Otherwise update the existing item
      this.currentRequest.items[existingIndex] = this.editingItem;
    }
    
    this.computeTotalAmount();
    this.itemDialogVisible = false;
    this.editingItem = null;
    
    // Update pagination after item changes
    setTimeout(() => {
      this.managePagination();
    }, 200);
  }
  
  /**
   * Remove an item from the purchase request
   */
  removeItem(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this item?',
      accept: () => {
        this.currentRequest.items.splice(index, 1);
        this.computeTotalAmount();
        
        // Update pagination after removing an item
        setTimeout(() => {
          this.managePagination();
        }, 100);
      }
    });
  }

  /**
   * Navigate back to the previous page
   */
  goBack() {
    this.router.navigate(['/shared/app-pr-shared']);
  }

 /**
 * Refresh data from the database
 */
private async refreshData() {
  this.loading =true;
  try {
    await this.loadData();
    
    // Find the current request in the updated data
    const updatedRequest = this.allPr.find(pr => pr.id === this.currentRequest.id);
    if (updatedRequest) {
      // Update the current request with the fresh data
      this.currentRequest = updatedRequest;
      

      // Recalculate totals
      this.computeTotalAmount();
    }
    
    
    // Trigger change detection and DOM updates
    if (this.isEditMode === false) {
      // Create a clean view for display mode
      setTimeout(() => {
        this.managePagination();
      }, 200);
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to refresh data'
    });
  }
  this.loading =false;
}
  
/**
 * This method manages the A4 pagination of the document
 * It creates appropriate A4 pages based on content and ensures proper flow
 */
managePagination() {
  if (this.isEditMode) return; // No pagination in edit mode
  if (this._isUpdatingPagination) return;
  
  this._isUpdatingPagination = true;
  
  try {
    const container = document.querySelector('.a4-container');
    if (!container) {
      this._isUpdatingPagination = false;
      return;
    }
    
    // Step 1: Get elements and measurements
    const firstPage = document.querySelector('.a4-page.first-page');
    if (!firstPage) {
      this._isUpdatingPagination = false;
      return;
    }
    
    // Clear any pages beyond the first page
    Array.from(container.querySelectorAll('.a4-page:not(.first-page)')).forEach(page => {
      page.remove();
    });
    
    // Step 2: Check if all content fits on first page
    const pageRect = firstPage.getBoundingClientRect();
    const signatures = firstPage.querySelector('.signature-section');
    
    if (!signatures) {
      this._isUpdatingPagination = false;
      return;
    }
    
    // Get position of signature section
    const signaturesRect = signatures.getBoundingClientRect();
    
    // Calculate if signatures fit on first page
    // A4 height is 297mm, with 10mm padding on top and bottom = 277mm usable height
    // Convert to pixels for comparison (1mm ≈ 3.78px at 96dpi)
    const a4HeightPx = 297 * 3.78; 
    const bottomPaddingPx = 10 * 3.78;
    const pageBottomPx = pageRect.top + a4HeightPx - bottomPaddingPx;
    
    // Check if signatures overflow the page
    if (signaturesRect.bottom > pageBottomPx) {
      // Signatures don't fit on first page - move to a new page
      
      // Step 3: Create a second page for signatures
      const secondPage = document.createElement('div');
      secondPage.className = 'a4-page signature-page';
      
      // Remove signatures from first page
      signatures.remove();
      
      // Add signatures to second page
      secondPage.appendChild(signatures);
      
      // Add page number to second page
      const pageNumber2 = document.createElement('div');
      pageNumber2.className = 'page-number';
      secondPage.appendChild(pageNumber2);
      
      // Add second page to container
      container.appendChild(secondPage);
      
      // Update page numbers
      this.updatePageNumbers(container);
    } else {
      // Everything fits on one page
      this.updatePageNumbers(container);
    }
    
    // Apply additional enhancements
    this.applyUIUXEnhancements();
    
  } catch (error) {
    console.error('Error in pagination:', error);
  } finally {
    this._isUpdatingPagination = false;
  }
}

/**
 * Apply UI/UX enhancements to pages
 */
applyUIUXEnhancements() {
  // Add visual indicators and styling enhancements
  const pages = document.querySelectorAll('.a4-page');
  
  pages.forEach((page, index) => {
    // Add data attribute for page number
    page.setAttribute('data-page', (index + 1).toString());
    
    // Add specific styling based on page content
    if (page.querySelector('.signature-section')) {
      page.classList.add('has-signatures');
    }
    
    // Ensure proper table rendering
    const tables = page.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add('a4-optimized-table');
    });
  });
}

/**
 * Update page numbers on all pages
 */
updatePageNumbers(container: Element) {
  const pages = container.querySelectorAll('.a4-page');
  const totalPages = pages.length;
  
  pages.forEach((page, index) => {
    let pageNumber = page.querySelector('.page-number');
    if (!pageNumber) {
      pageNumber = document.createElement('div');
      pageNumber.className = 'page-number';
      page.appendChild(pageNumber);
    }
    
    pageNumber.textContent = `Page ${index + 1} of ${totalPages}`;
  });
}

  
/**
 * Creates an A4-sized page container.
 */
private createPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'a4-page optimized-layout';
  return page;
}


  /**
   * Ensures we only have a single page when content is small
   */
  private ensureSinglePage(container: Element) {
    // Clear container first
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create a single page
    const page = document.createElement('div');
    page.className = 'a4-page';
    page.id = 'page-1';
    
    // Add content sections
    
    // Header
    const header = document.querySelector('.header');
    if (header) page.appendChild(header.cloneNode(true));
    
    // Vendor info
    const vendorInfo = document.querySelector('.vendor-info-section');
    if (vendorInfo) page.appendChild(vendorInfo.cloneNode(true));
    
    // PR form
    const prForm = document.createElement('div');
    prForm.className = 'pr-form';
    
    // PR header and details
    const prHeader = document.querySelector('.pr-header');
    const prDetails = document.querySelector('.pr-details');
    if (prHeader) prForm.appendChild(prHeader.cloneNode(true));
    if (prDetails) prForm.appendChild(prDetails.cloneNode(true));
    
    // Table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'p-datatable-wrapper';
    
    // Clone the original table
    const originalTable = document.querySelector('.p-datatable-table');
    if (originalTable) {
      tableContainer.appendChild(originalTable.cloneNode(true));
    }
    
    prForm.appendChild(tableContainer);
    
    // Purpose section
    const purposeSection = document.querySelector('.purpose-section');
    if (purposeSection) prForm.appendChild(purposeSection.cloneNode(true));
    
    page.appendChild(prForm);
    
    // Signature section
    const signatureSection = document.querySelector('.signature-section');
    if (signatureSection) page.appendChild(signatureSection.cloneNode(true));
    
    // Add page number
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = 'Page 1 of 1';
    page.appendChild(pageNumber);
    
    container.appendChild(page);
  }
  
  /**
   * Creates multiple pages for content that exceeds a single page
   */
  private createPages(container: Element, rows: NodeListOf<Element>, rowsPerPage: number) {
    // Clear existing pages
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create first page with headers
    const firstPage = this.createFirstPage();
    container.appendChild(firstPage);
    
    // Calculate total pages needed
    const numTablePages = Math.ceil(rows.length / rowsPerPage);
    const totalPages = numTablePages + 1; // +1 for signature page
    
    // Create continuation pages for remaining rows
    this.createContinuationPages(container, rows, rowsPerPage, numTablePages);
    
    // Create signature page (always last)
    const signaturePage = this.createSignaturePage(totalPages);
    container.appendChild(signaturePage);
    
    // Update all page numbers
    this.updatePageNumbers(container);
  }

  /**
   * Creates the first page with header content
   */
  private createFirstPage(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'a4-page';
    page.id = 'page-1';
    
    // Clone header elements
    const header = document.querySelector('.header');
    const vendorInfo = document.querySelector('.vendor-info-section');
    
    if (header) page.appendChild(header.cloneNode(true));
    if (vendorInfo) page.appendChild(vendorInfo.cloneNode(true));
    
    // Create PR form container for the table
    const prForm = document.createElement('div');
    prForm.className = 'pr-form';
    
    // PR header and details
    const prHeader = document.querySelector('.pr-header');
    const prDetails = document.querySelector('.pr-details');
    if (prHeader) prForm.appendChild(prHeader.cloneNode(true));
    if (prDetails) prForm.appendChild(prDetails.cloneNode(true));
    
    // Create table structure with initial rows
    this.createTableStructure(prForm, 0, Math.min(this.rowsPerPage, this.currentRequest.items.length));
    
    page.appendChild(prForm);
    
    // Add page number
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = 'Page 1';
    page.appendChild(pageNumber);
    
    return page;
  }
  
  /**
   * Creates continuation pages for remaining rows
   */
  private createContinuationPages(container: Element, rows: NodeListOf<Element>, rowsPerPage: number, numTablePages: number) {
    // Skip if we only need one page for the table
    if (numTablePages <= 1) return;
    
    // Create continuation pages for remaining rows
    for (let i = 1; i < numTablePages; i++) {
      const startRow = i * rowsPerPage;
      const endRow = Math.min(startRow + rowsPerPage, rows.length);
      
      const page = document.createElement('div');
      page.className = 'a4-page';
      page.id = `page-${i + 1}`;
      
      // Create continuation header
      const continuationHeader = document.createElement('div');
      continuationHeader.className = 'continuation-header';
      continuationHeader.innerHTML = '<h3>PURCHASE REQUEST (Continued)</h3>';
      page.appendChild(continuationHeader);
      
      // Create PR form container for the table
      const prForm = document.createElement('div');
      prForm.className = 'pr-form';
      
      // Add continuing table
      this.createTableStructure(prForm, startRow, endRow);
      
      page.appendChild(prForm);
      
      // Add page number
      const pageNumber = document.createElement('div');
      pageNumber.className = 'page-number';
      pageNumber.textContent = `Page ${i + 1}`;
      page.appendChild(pageNumber);
      
      container.appendChild(page);
      
      // Add purpose section to the last table page
      if (i === numTablePages - 1) {
        const purposeSection = document.querySelector('.purpose-section');
        if (purposeSection) {
          page.appendChild(purposeSection.cloneNode(true));
        }
      }
    }
  }
  
  /**
   * Creates the signature page
   */
  private createSignaturePage(pageNumber: number): HTMLElement {
    const page = document.createElement('div');
    page.className = 'a4-page';
    page.id = `page-${pageNumber}`;
    
    // Clone signature section
    const signatureSection = document.querySelector('.signature-section');
    if (signatureSection) {
      page.appendChild(signatureSection.cloneNode(true));
    }
    
    // Add page number
    const pageNumberElement = document.createElement('div');
    pageNumberElement.className = 'page-number';
    pageNumberElement.textContent = `Page ${pageNumber}`;
    page.appendChild(pageNumberElement);
    
    return page;
  }
  
  /**
   * Creates a table structure with rows from startRow to endRow
   */
  private createTableStructure(container: HTMLElement, startRow: number, endRow: number) {
    if (!this.currentRequest || !this.currentRequest.items) return;
    
    // Create table element
    const tableContainer = document.createElement('div');
    tableContainer.className = 'p-datatable-wrapper';
    
    const table = document.createElement('table');
    table.className = 'p-datatable-table';
    
    // Create header
    const tableHeader = document.createElement('thead');
    tableHeader.className = 'p-datatable-thead';
    
    // Clone original header or create a new one
    const originalHeader = document.querySelector('.p-datatable-thead tr');
    if (originalHeader) {
      const headerClone = originalHeader.cloneNode(true) as HTMLElement;
      
      // Remove action column if present (only shows in edit mode)
      const actionHeader = headerClone.querySelector('th:last-child');
      if (actionHeader && actionHeader.textContent?.trim().toLowerCase() === 'actions') {
        headerClone.removeChild(actionHeader);
      }
      
      tableHeader.appendChild(headerClone);
    } else {
      // Create default header if original not found
      const headerRow = document.createElement('tr');
      
      const columns = ['ITEM NO.', 'UNIT', 'ITEM / DESCRIPTION', 'QTY.', 'ESTIMATED UNIT COST', 'ESTIMATED TOTAL'];
      columns.forEach(colName => {
        const th = document.createElement('th');
        th.textContent = colName;
        headerRow.appendChild(th);
      });
      
      tableHeader.appendChild(headerRow);
    }
    
    table.appendChild(tableHeader);
    
    // Create body
    const tableBody = document.createElement('tbody');
    tableBody.className = 'p-datatable-tbody';
    
    // Add rows from the current request items
    const items = this.currentRequest.items.slice(startRow, endRow);
    items.forEach((item, index) => {
      const row = document.createElement('tr');
      
      // Item number
      const tdNum = document.createElement('td');
      tdNum.textContent = (startRow + index + 1).toString();
      row.appendChild(tdNum);
      
      // Unit
      const tdUnit = document.createElement('td');
      tdUnit.textContent = item.unit_of_measurement;
      row.appendChild(tdUnit);
      
      // Description
     // Description
    const tdDesc = document.createElement('td');
    tdDesc.textContent = item.technical_specification || null;
    row.appendChild(tdDesc);
      
      // Quantity
      const tdQty = document.createElement('td');
      tdQty.textContent = item.quantity_required.toString();
      row.appendChild(tdQty);
      
      // Unit cost
      const tdUnitCost = document.createElement('td');
      tdUnitCost.textContent = item.estimated_unit_cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      row.appendChild(tdUnitCost);
      
      // Total cost
      const tdTotalCost = document.createElement('td');
      tdTotalCost.textContent = item.estimated_total_cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      row.appendChild(tdTotalCost);
      
      tableBody.appendChild(row);
    });
    
    table.appendChild(tableBody);
    
    // Add footer with total if this is the last table
    if (endRow >= this.currentRequest.items.length) {
      const tableFooter = document.createElement('tfoot');
      
      const footerRow = document.createElement('tr');
      
      const totalLabelCell = document.createElement('td');
      totalLabelCell.colSpan = 5;
      totalLabelCell.className = 'text-right';
      totalLabelCell.innerHTML = '<strong>TOTAL</strong>';
      footerRow.appendChild(totalLabelCell);
      
      const totalValueCell = document.createElement('td');
      totalValueCell.className = 'total-amount-cell';
      totalValueCell.innerHTML = `<strong>₱ ${this.currentRequest.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>`;
      footerRow.appendChild(totalValueCell);
      
      tableFooter.appendChild(footerRow);
      table.appendChild(tableFooter);
    }
    
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
  }
  
  /**
   * Export to PDF with proper A4 pagination
   * Handles edit mode by temporarily switching to view mode if needed
   */
/**
 * Export to PDF with proper content preservation
 */
/**
 * Export to PDF with proper content preservation
 */
async exportToPDF(): Promise<void> {
  try {
    const wasInEditMode = this.isEditMode;
    
    // If in edit mode, switch to view mode first for proper pagination
    if (wasInEditMode) {
      // Save changes before exporting
      await this.saveChanges();
      
      // Wait for view to update
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Force a clean pagination rendering
    this.refreshPagination();
    
    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const prNumber = this.currentRequest?.prNo || 'PR-XXXX';
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get all A4 pages
    const pages = document.querySelectorAll('.a4-page');
    
    if (!pages || pages.length === 0) {
      throw new Error('No pages found for PDF export');
    }
    
    console.log(`Found ${pages.length} pages to export`);
    
    // Handle each page separately
    for (let i = 0; i < pages.length; i++) {
      // Add a new page for each page after the first
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add debug info before rendering
      console.log(`Rendering page ${i + 1}, content size: ${(pages[i] as HTMLElement).innerHTML.length}`);
      
      // Force any images to load completely before rendering
      const images = Array.from(pages[i].querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
      
      // Render page to canvas with improved settings
      const canvas = await html2canvas(pages[i] as HTMLElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging
        onclone: (clonedDoc) => {
          // Ensure all content is visible in the clone
          // The error was here - we need to check if the page has an ID before using it
          if (pages[i].id) {
            const clonedPage = clonedDoc.querySelector(`#${pages[i].id}`);
            if (clonedPage) {
              (clonedPage as HTMLElement).style.overflow = 'visible';
              (clonedPage as HTMLElement).style.height = 'auto';
              (clonedPage as HTMLElement).style.display = 'block';
            }
          } else {
            // For pages without IDs, use a different approach
            const clonedPages = clonedDoc.querySelectorAll('.a4-page');
            if (clonedPages && clonedPages.length > i) {
              const clonedPage = clonedPages[i] as HTMLElement;
              clonedPage.style.overflow = 'visible';
              clonedPage.style.height = 'auto';
              clonedPage.style.display = 'block';
            }
          }
        }
      });
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      pdf.addImage(
        imgData,
        'PNG',
        0, // left margin
        0, // top margin
        210, // width (A4 width)
        297, // height (A4 height)
        '', // alias
        'FAST', // compression
        0 // rotation
      );
      
      // Add page number to the footer
      pdf.setFontSize(10);
      pdf.text(
        `PR No: ${prNumber} | Page ${i + 1} of ${pages.length}`, 
        200, // x position (right aligned)
        290, // y position (bottom of page)
        { align: 'right' }
      );
    }
    
    // Save the PDF
    pdf.save(`PR-${prNumber}-${new Date().toISOString().slice(0, 10)}.pdf`);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'PDF exported successfully'
    });
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to export PDF. Please try again.'
    });
  }
}

/**
 * Ensure a clean pagination for export
 */
private refreshPagination(): void {
  // Find the container
  const container = document.querySelector('.a4-container');
  if (!container) return;
  
  // Store the original content
  const originalContent = container.innerHTML;
  
  // Clear the container
  container.innerHTML = '';
  
  // Force a reflow
  void (container as HTMLElement).offsetHeight;
  
  // Create our own pagination structure
  // First get all the main content sections
  const prContainer = document.querySelector('.pr-container');
  if (!prContainer) {
    container.innerHTML = originalContent;
    return;
  }
  
  // 1. Create the first page with headers
  const firstPage = document.createElement('div');
  firstPage.className = 'a4-page';
  firstPage.id = 'export-page-1';
  
  // Get main content sections
  const header = document.querySelector('.header');
  const vendorInfo = document.querySelector('.vendor-info-section');
  const prForm = document.querySelector('.pr-form');
  const signatureSection = document.querySelector('.signature-section');
  
  // Check if we have enough content
  if (!header || !vendorInfo || !prForm) {
    // If missing critical elements, revert to original
    container.innerHTML = originalContent;
    console.warn('Missing critical elements for PDF export');
    return;
  }
  
  // Clone all content to avoid modifying originals
  const headerClone = header.cloneNode(true);
  const vendorInfoClone = vendorInfo.cloneNode(true);
  const prFormClone = prForm.cloneNode(true);
  
  // Add to first page
  firstPage.appendChild(headerClone);
  firstPage.appendChild(vendorInfoClone);
  firstPage.appendChild(prFormClone);
  
  // Check if we need to split content
  const items = this.currentRequest?.items || [];
  const needsMultiplePages = items.length > 5;
  
  if (!needsMultiplePages) {
    // Add signature section to first page if it fits
    if (signatureSection) {
      firstPage.appendChild(signatureSection.cloneNode(true));
    }
    
    // Add page number
    const pageNumber = document.createElement('div');
    // pageNumber.className = 'page-number';
    pageNumber.textContent = `PR No: ${this.currentRequest?.prNo || 'PR-XXXX'} | Page 1 of 1`;
    firstPage.appendChild(pageNumber);
    
    // Add to container
    container.appendChild(firstPage);
  } else {
    // Create a second page for signatures
    const secondPage = document.createElement('div');
    secondPage.className = 'a4-page';
    secondPage.id = 'export-page-2';
    
    // Add signature section
    if (signatureSection) {
      secondPage.appendChild(signatureSection.cloneNode(true));
    }
    
    // Add page numbers
    const pageNumber1 = document.createElement('div');
    pageNumber1.className = 'page-number';
    pageNumber1.textContent = `PR No: ${this.currentRequest?.prNo || 'PR-XXXX'} | Page 1 of 2`;
    firstPage.appendChild(pageNumber1);
    
    const pageNumber2 = document.createElement('div');
    pageNumber2.className = 'page-number';
    pageNumber2.textContent = `PR No: ${this.currentRequest?.prNo || 'PR-XXXX'} | Page 2 of 2`;
    secondPage.appendChild(pageNumber2);
    
    // Add to container
    container.appendChild(firstPage);
    container.appendChild(secondPage);
  }
  
  // Force layout calculation
  void (container as HTMLElement).offsetHeight;
}

  
  /**
   * Method to select vendor from dropdown
   */
  selectVendor(vendor: VendorInfo) {
    if (!this.currentRequest.vendor) {
      this.currentRequest.vendor = {
        id: '',
        companyName: '',
        address: '',
        tin: '',
        telFax: '',
        email: ''
      };
    }
    
    this.currentRequest.vendor.companyName = vendor.companyName;
    this.currentRequest.vendor.tin = vendor.tin;
    this.currentRequest.vendor.address = vendor.address;
    this.currentRequest.vendor.telFax = vendor.telFax;
    this.currentRequest.vendor.email = vendor.email;
    
    // Update pagination after vendor selection
    if (!this.isEditMode) {
      setTimeout(() => {
        this.managePagination();
      }, 100);
    }
  }
  
  requestedSignature:SignatureModalData<Partial<PurchaseRequestExtended>> = {
    'show': false,
    'id': 'signature',
    'data': {},
    'submit': async (signed)=>{
      this.loading = true;
      if(this.approvers.length){
        this.crudService.create(Notification, {
         'created_at': new Date(),
         'is_read':false,
         'type':'info',
         'user_id': this.approvers[0].user_id,
         'message': `Purchase Request (${signed.prNo}) needs approval`
       })
      }
      await this.crudService.partial_update(PurchaseRequest, signed.id!, {
        'signature': signed.signature,
        'status':'Pending',
        'current_approver_level': signed.current_approver_level! + 1
      })
      
      await this.refreshData();
      this.loading =false;
      this.isSigning =false;
      this.crudService.toast({
        severity: 'success',
        summary: 'Submitted!',
        detail: 'Purchase request has been submitted for approval.'
      });
    }
  }

  approvedSignature:SignatureModalData<Partial<ApproverExtended>> = {
    'show': false,
    'id': 'signature',
    'data': {},
    'submit': async (signed)=>{
      this.loading = true;

        await this.crudService.create(Approvals, {
          approver_id: signed.id!,
          document_id: this.currentRequest.id,
          approval_status: 'Approved',
          signature: signed.signature,
          timestamp: new Date(),
          entity_id: '2'
        })
        const lastApprover = this.approvers.length == signed.approval_order;
        if(lastApprover){
          this.crudService.create(Notification, {
            'created_at': new Date(),
            'is_read':false,
            'type':'info',
            'user_id': this.currentRequest.user_id,
            'message': `Purchase Request (${this.currentRequest.prNo}) has been approved and can now under-go procurement.`
          })
          await this.crudService.partial_update(PurchaseRequest, this.currentRequest.id, {
            'current_approver_level': signed.approval_order! + 1,
            'current_procurement_level': 1,
            'status': 'Approved'
          })
        }else{
          this.crudService.create(Notification, {
            'created_at': new Date(),
            'is_read':false,
            'type':'info',
            'user_id': this.approvers[this.currentRequest.current_approver_level].user_id,
            'message': `Purchase Request (${this.currentRequest.prNo}) needs approval`
          })
          this.crudService.create(Notification, {
            'created_at': new Date(),
            'is_read':false,
            'type':'info',
            'user_id': this.currentRequest.user_id,
            'message': `Purchase Request (${this.currentRequest.prNo}) has been approved by ${signed.name}`
          })
          await this.crudService.partial_update(PurchaseRequest, this.currentRequest.id, {
            'current_approver_level': signed.approval_order! + 1,
          })
          
        }
        
    
      await this.refreshData();
      this.loading =false;
      this.crudService.toast({
        severity: 'success',
        summary: 'Approved!',
        detail: 'Purchase request has been approved.'
      });
      this.isSigning =false;
    }
  }


  /**
   * Open signature upload dialog
   */
  openSignatureUpload(type: 'requester' | 'approver', data?:  ApproverExtended): void {
    if(type == 'requester'){
      this.requestedSignature.data = this.currentRequest;
      this.requestedSignature.show = true;
    }else{
      this.approvedSignature.data = data!;
      this.approvedSignature.show = true;
    }
  }
  
  /**
   * Remove a signature
   */
  async removeSignature(type: 'requester' | 'approver', id?: string): Promise<void> {
    this.loading = true;
    if(type == 'requester'){
      await this.crudService.partial_update(PurchaseRequest, this.currentRequest.id, {
        'signature': undefined,
      })
    }else{
      await this.crudService.delete(Approvals,id!)
    }
    this.refreshData();
  }
  
  /**
   * Window resize handler to update pagination
   */
  @HostListener('window:resize')
  onResize() {
    // Debounce resize events
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }
    
    this._resizeTimeout = setTimeout(() => {
      // Only update pagination in view mode
      if (!this.isEditMode) {
        this.managePagination();
      }
    }, 300);
  }
  
  // Property to store resize timeout
  private _resizeTimeout: any = null;
}