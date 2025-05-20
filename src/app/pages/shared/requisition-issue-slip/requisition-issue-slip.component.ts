import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DeliveryService } from 'src/app/services/delivery.service';
import { RequestItemService } from 'src/app/services/request-item.service';
import { DeliveredStock, RequestItem } from 'src/app/schema/schema';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-requisition-issue-slip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './requisition-issue-slip.component.html',
  styleUrls: ['./requisition-issue-slip.component.scss']
})
export class RequisitionIssueSlipComponent implements OnInit {
  loading: boolean = true;
  deliveredStock: DeliveredStock | null = null;
  requestedByPosition: string = '';
  approvedByPosition: string = '';
  issuedByPosition: string = '';
  dateApproved?: Date;
  dateIssued?: Date;
  originalRequestItem?: RequestItem;

  @ViewChild('risPreview') risPreview!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private deliveryService: DeliveryService,
    private requestItemService: RequestItemService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      
      // Get the deliveredStock ID from the route parameters
      const params = this.route.snapshot.params;
      const id = params['id'];
      
      if (!id) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No delivery ID provided'
        });
        this.loading = false;
        return;
      }
      
      // Load the delivered stock data
      await this.loadDeliveredStock(id);
      
      this.loading = false;
    } catch (error) {
      console.error('Error initializing RIS component:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load Requisition and Issue Slip data'
      });
      this.loading = false;
    }
  }

  /**
   * Load delivered stock data by ID
   */
  async loadDeliveredStock(id: string | number) {
    try {
      // Get the delivered stock
      const result = await this.deliveryService.getById(id);
      
      if (!result) {
        throw new Error('Delivered stock not found');
      }
      
      this.deliveredStock = result;
      
      console.log('Loaded Delivered Stock:', {
        requisitionNumber: this.deliveredStock.requisitionNumber,
        requestedBy: this.deliveredStock.requestedBy,
        approvedBy: this.deliveredStock.approvedBy,
        issuedBy: this.deliveredStock.issuedBy
      });
      
      // If we have a requisitionNumber (which should be the request item code), 
      // try to load the original request for additional information
      if (this.deliveredStock.requisitionNumber) {
        await this.loadOriginalRequest(this.deliveredStock.requisitionNumber);
      }
    } catch (error) {
      console.error('Error loading delivered stock:', error);
      throw error;
    }
  }

  /**
   * Load the original request item for additional information
   */
  async loadOriginalRequest(requisitionNumber: string) {
    try {
      // Get all request items and find the one with matching itemCode
      const allRequests = await this.requestItemService.getAll();
      this.originalRequestItem = allRequests.find(req => req.itemCode === requisitionNumber);
      
      console.log('Original Request Item:', this.originalRequestItem);
      
      // Always set default positions regardless of whether original request is found
      this.requestedByPosition = 'Department Staff';
      this.approvedByPosition = 'Department Head';
      this.issuedByPosition = 'Supply Officer';
      
      if (this.originalRequestItem) {
        // Override with actual positions if available
        if (this.originalRequestItem.approverPosition) {
          this.approvedByPosition = this.originalRequestItem.approverPosition;
        }
        
        if (this.originalRequestItem.issuerPosition) {
          this.issuedByPosition = this.originalRequestItem.issuerPosition;
        }
        
        // Extract dates
        this.dateApproved = this.originalRequestItem.dateApproved || new Date();
        this.dateIssued = this.originalRequestItem.dateIssued || new Date();
        
        // If deliveredStock is missing approvedBy or issuedBy, get them from originalRequestItem
        if (this.deliveredStock) {
          if (!this.deliveredStock.approvedBy && this.originalRequestItem.approvedBy) {
            this.deliveredStock.approvedBy = this.originalRequestItem.approvedBy;
            console.log('Updated approvedBy from original request:', this.deliveredStock.approvedBy);
          }
          
          if (!this.deliveredStock.issuedBy && this.originalRequestItem.issuedBy) {
            this.deliveredStock.issuedBy = this.originalRequestItem.issuedBy;
            console.log('Updated issuedBy from original request:', this.deliveredStock.issuedBy);
          }
        }
      } else {
        // Set default dates if no original request is found
        this.dateApproved = new Date();
        this.dateIssued = new Date();
      }
    } catch (error) {
      console.error('Error loading original request:', error);
      // Non-critical error, so just log it without throwing
      
      // Set default values if an error occurs
      this.requestedByPosition = 'Department Staff';
      this.approvedByPosition = 'Department Head';
      this.issuedByPosition = 'Supply Officer';
      this.dateApproved = new Date();
      this.dateIssued = new Date();
    }
  }

  /**
   * Calculate total items
   */
  getTotalItems(): number {
    if (!this.deliveredStock?.details) return 0;
    return this.deliveredStock.details.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Find the matching request item detail from original request
   */
  findMatchingRequestItem(itemCode: string): any {
    if (!this.originalRequestItem || !this.originalRequestItem.items) {
      return null;
    }
    return this.originalRequestItem.items.find(i => i.stockNo === itemCode);
  }

  /**
   * Check if the stock is available
   */
  isStockAvailable(itemCode: string, value: 'yes' | 'no'): boolean {
    const item = this.findMatchingRequestItem(itemCode);
    return item?.stockAvailable === value;
  }

  /**
   * Get issue quantity for item
   */
  getIssueQuantity(itemCode: string, defaultQuantity: number): number {
    const item = this.findMatchingRequestItem(itemCode);
    return item?.issueQuantity || defaultQuantity;
  }

  /**
   * Export RIS to PDF
   */
  async exportToPDF() {
    try {
      // Ensure the element is in view
      window.scrollTo(0, 0);
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const risPreviewElement = this.risPreview.nativeElement;
      if (!risPreviewElement) {
        throw new Error('RIS preview element not found');
      }
      
      // Create PDF with A4 size (portrait)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Capture the element as canvas
      const canvas = await html2canvas(risPreviewElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `RIS_${this.deliveredStock?.requisitionNumber || 'Form'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'PDF exported successfully'
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export PDF'
      });
    }
  }

  /**
   * Navigate back to the delivered-stock component
   */
  goBack() {
    this.router.navigate(['/shared/delivered-stock/']);
  }
}
