import { Component, OnInit, AfterViewInit, AfterViewChecked, HostListener, ElementRef, ViewChild } from '@angular/core';
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
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Office, PPMP, PPMPItem, PPMPProject, PPMPSchedule, ProcurementMode, Users, Approver, Approvals, } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { UserService } from 'src/app/services/user.service';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fix the interface extending issue by not directly extending PPMPProject
interface PPMPProjectJoin {
  // Include PPMPProject properties without extending it
  id: string;
  project_code: string;
  project_title: string;
  project_description: string;
  procurement_mode_id: string;
  classifications: string; // Changed to string to match the error message
  user_budget_id: string;
  abc?: number;
  contract_scope?: string;
  ppmp_id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'; // Restricted to only these values
  
  // Additional properties
  office: string;
  totalAmount: number;
  mode_name: string;
  status_extended: string;
  items_count: number;
  items?: PPMPItem[];
  schedules?: PPMPSchedule[];
  user_signature?: string;
  head_signature?: string;
  fiscal_year?: number;
  office_id?: string;
}


@Component({
  selector: 'app-ppmp-docs',
  templateUrl: './ppmp-docs.component.html',
  styleUrls: ['./ppmp-docs.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    RouterModule,
    TableModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class PpmpDocumentComponent implements OnInit, AfterViewInit, AfterViewChecked {
  // Basic properties
  loading: boolean = true;
  isEditMode: boolean = false;
  isDocumentView: boolean = true;
  selectedFiscalYear: number = new Date().getFullYear();
  animationClass: string = '';
  
  // Data properties
  selectedOffice?: Office;
  selectedPpmps: PPMPProjectJoin[] = [];
  user?: Users;
  userSignature?: string;
  headSignature?: string;
  headName?: string;
 approvedByNames: string[] = [];
approvedByPositions: string[] = [];
approvedBySignatures: string[] = [];

  @ViewChild('ppmpPreview') ppmpPreview!: ElementRef;
  // Month array for schedule display
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Pagination variables
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
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService,
    private userService: UserService
  ) { }
  

  async ngOnInit() {
  try {
    this.loading = true;
    this.user = this.userService.getUser();
    
    // Get URL parameters
    const params = await firstValueFrom(this.activatedRoute.queryParams);
    const officeId = params['officeId']; 
    const fiscalYear = params['fiscalYear'] ? parseInt(params['fiscalYear']) : this.selectedFiscalYear;
    this.selectedFiscalYear = fiscalYear;
    
    // Load data using the parameters
    await this.loadData(officeId, fiscalYear);
    
    this.loading = false;
    
    // Add animation class with delay
    setTimeout(() => {
      this.animationClass = 'fade-in';
    }, 100);
  } catch (error) {
    console.error('Error initializing component:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to initialize component'
    });
    this.loading = false;
  }
}

  
  ngAfterViewInit() {
    setTimeout(() => {
      this.managePagination();
    }, 500);
  }
  
  ngAfterViewChecked() {
    // Only run pagination if edit mode changed to prevent continuous updates
    if (this._lastEditMode !== this.isEditMode && !this._isUpdatingPagination) {
      this._lastEditMode = this.isEditMode;
      
      // Schedule pagination update to avoid ExpressionChangedAfterItHasBeenChecked error
      setTimeout(() => this.managePagination(), 200);
    }
  }
  
  /**
   * Load data for the PPMP document
   */


  
async loadData(officeId?: string, fiscalYear?: number) {
  try {
    const [ppmps, projects, items, offices, modes, schedules, users] = await this.crudService.forJoin(
      PPMP, PPMPProject, PPMPItem, Office, ProcurementMode, PPMPSchedule, Users
    );
    
    // Filter by fiscal year and office
    const filteredPpmps = ppmps.filter(ppmp => {
      return (
        (!fiscalYear || ppmp.fiscal_year === fiscalYear) &&
        (!officeId || ppmp.office_id === officeId)
      );
    });
    
    if (filteredPpmps.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Data',
        detail: 'No PPMPs found for the selected criteria'
      });
      return;
    }
    
    // Set selected office
    if (officeId) {
      this.selectedOffice = offices.find(o => o.id === officeId);
    }
    
    // Get PPMP projects with details
    this.selectedPpmps = projects
      .filter(project => {
        const ppmp = filteredPpmps.find(p => p.id === project.ppmp_id);
        return ppmp !== undefined;
      })
      .map(project => {
        const ppmp = filteredPpmps.find(p => p.id === project.ppmp_id);
        const office = offices.find(o => o.id === ppmp?.office_id);
        const mode = modes.find(m => m.id === project.procurement_mode_id);
        const projectItems = items.filter(i => i.ppmp_project_id === project.id);
        const projectSchedules = schedules.filter(s => s.ppmp_id === ppmp?.id);
        
        // Find user signature and head signature
        this.userSignature = ppmp?.user_signature;
        this.headSignature = ppmp?.head_signature;
        
        // Find head name if available
        if (ppmp?.approved_by_id) {
          const head = users.find(u => u.id === ppmp.approved_by_id);
          if (head) {
            this.headName = head.fullname;
          }
        }
        
        // Convert the project status to make sure it's one of the allowed values
        let status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'DRAFT';
        if (project.status === 'PENDING' || project.status === 'APPROVED' || project.status === 'REJECTED') {
          status = project.status;
        }
        
        // Convert classifications from array to string if needed
        const classifications = typeof project.classifications === 'string' 
          ? project.classifications 
          : Array.isArray(project.classifications) 
            ? project.classifications.join(',') 
            : '';
        
        // Create a completely new object instead of spreading project
        const result: PPMPProjectJoin = {
          id: project.id,
          project_code: project.project_code || 'N/A',
          project_title: project.project_title || 'N/A',
          project_description: project.project_description || '',
          procurement_mode_id: project.procurement_mode_id || '1',
          classifications: classifications,
          user_budget_id: project.user_budget_id,
          abc: project.abc,
          contract_scope: project.contract_scope,
          ppmp_id: project.ppmp_id,
          status: status,
          
          // Additional properties
          office: office?.name ?? 'N/A',
          mode_name: mode?.mode_name || 'Public Bidding',
          status_extended: ppmp?.status ?? 'N/A',
          items_count: projectItems.length,
          items: projectItems,
          schedules: projectSchedules,
          totalAmount: projectItems.reduce((acc, item) => 
            acc + (item.estimated_unit_cost * item.quantity_required), 0),
          office_id: ppmp?.office_id,
          fiscal_year: ppmp?.fiscal_year,
          user_signature: ppmp?.user_signature,
          head_signature: ppmp?.head_signature
        };
        
        return result;
      });

    // Load Approver and Approvals data where entity_id = 1
    const approvers = await this.crudService.getAll(Approver);
    const approvals = await this.crudService.getAll(Approvals);
    const usersForApprover = await this.crudService.getAll(Users); // Renamed to avoid conflict

    // Find all approvers with entity_id = '1'
    const approversForEntity = approvers.filter(approver => approver.entity_id === '1');
    this.approvedByNames = [];
    this.approvedByPositions = [];
    this.approvedBySignatures = [];

    approversForEntity.forEach(approvedBy => {
      // Find the related user to get the name and position
      const relatedUser = usersForApprover.find(user => user.id === approvedBy.user_id);
      this.approvedByNames.push(relatedUser?.fullname || 'Not Assigned');
      this.approvedByPositions.push(relatedUser?.position || 'BAC Secretariate');

      // Find the approval for this approver
      const approval = approvals.find(approval => 
        approval.approver_id === approvedBy.id && 
        approval.entity_id === '1' && 
        approval.approval_status === 'Approved'
      );
      this.approvedBySignatures.push(approval?.signature || '');
    });
  } catch (error) {
    console.error('Error loading data:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load data'
    });
  }
}
  
  /**
   * Get total quantity for a PPMP
   */
  getTotalQuantity(ppmp: PPMPProjectJoin): string {
    if (!ppmp.items || ppmp.items.length === 0) {
      return '0';
    }
    
    const total = ppmp.items.reduce((acc, item) => acc + item.quantity_required, 0);
    return total.toString();
  }
  
  /**
   * Calculate total estimated cost for a PPMP
   */
  calculateTotalEstimatedCost(ppmp: PPMPProjectJoin): number {
    if (!ppmp.items || ppmp.items.length === 0) {
      return 0;
    }
      
    return ppmp.items.reduce((acc, item) => 
      acc + (item.estimated_unit_cost * item.quantity_required), 0);
  }
  
  /**
   * Check if a milestone is scheduled for the given month
   */
  isMilestoneScheduled(ppmp: PPMPProjectJoin, month: string): boolean {
    if (!ppmp.schedules || ppmp.schedules.length === 0) {
      return false;
    }
    
    const monthIndex = this.months.indexOf(month);
    if (monthIndex === -1) {
      return false;
    }
    
    // Check if any schedule falls in this month
    return ppmp.schedules.some(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getMonth() === monthIndex;
    });
  }
  
  /**
   * Get procurement mode label
   */
 getProcurementModeLabel(ppmp: PPMPProjectJoin): string {
  if (!ppmp.procurement_mode_id && !ppmp.mode_name) return 'N/A';
  const modeMap: { [key: string]: string } = {
    '1': 'Public Bidding',
    '2': 'Limited Source Bidding',
    '3': 'Direct Contracting',
    '4': 'Repeat Order',
    '5': 'Shopping',
    '6': 'Negotiated Procurement',
  };
  return ppmp.mode_name || modeMap[ppmp.procurement_mode_id] || 'N/A';
}
  
  /**
   * Navigate back to previous page
   */
  goBack() {
    this.router.navigate(['/enduser/ppmp']);
  }
  
  /**
   * Download PPMP as PDF
   */
  downloadPPMP() {
    this.exportToPDF();
  }
  
  /**
   * Export PPMP to PDF
   */
  async exportToPDF() {
  try {
    this.refreshPagination();

    // Ensure the element is in view and DOM is fully rendered
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay to 1500ms for better rendering

    const ppmpPreview = this.ppmpPreview.nativeElement;
    if (!ppmpPreview) {
      throw new Error('PPMP preview element not found');
    }

    // Create PDF instance
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Capture the element as canvas
    const canvas = await html2canvas(ppmpPreview, {
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // Enable logging to debug issues
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight
    });

    // Convert canvas to PNG data URL (not JPEG)
    const imgData = canvas.toDataURL('image/png', 1.0); // Explicitly using PNG with max quality
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Add footer text
    pdf.setFontSize(10);
    pdf.text(
      `PPMP FY ${this.selectedFiscalYear} | ${this.selectedOffice?.name || 'All Offices'}`,
      287,
      205,
      { align: 'right' }
    );

    // Save the PDF
    pdf.save(`PPMP-FY${this.selectedFiscalYear}-${this.selectedOffice?.name || 'All'}-${new Date().toISOString().slice(0, 10)}.pdf`);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'PDF downloaded successfully'
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to export PDF. Please try again. Check console for details.'
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
    
    // Update page numbers
    this.updatePageNumbers(container);
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
   * Manage pagination
   */
  managePagination() {
    if (this._isUpdatingPagination) return;
    
    this._isUpdatingPagination = true;
    
    try {
      const container = document.querySelector('.a4-container');
      if (!container) {
        this._isUpdatingPagination = false;
        return;
      }
      
      const pages = container.querySelectorAll('.a4-page');
      if (pages.length === 0) {
        this._isUpdatingPagination = false;
        return;
      }
      
      // Update page numbers
      this.updatePageNumbers(container);
      
    } catch (error) {
      console.error('Error in pagination:', error);
    } finally {
      this._isUpdatingPagination = false;
    }
  }
  
  /**
   * Handle window resize
   */
  @HostListener('window:resize')
  onResize() {
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }
    
    this._resizeTimeout = setTimeout(() => {
      if (!this.isEditMode) {
        this.managePagination();
      }
    }, 300);
  }
  
  private _resizeTimeout: any = null;
}