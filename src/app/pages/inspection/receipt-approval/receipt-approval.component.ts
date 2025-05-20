import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { DeliveryReceipt, DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { FluidModule } from 'primeng/fluid';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUpload, FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Router } from '@angular/router';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { RequisitionService } from 'src/app/services/requisition.service';
import { DeliveredItem, DeliveryItem } from '../../shared/delivered-items/delivered-items.interface';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
import { ChecklistModalComponent } from './checklist-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'primeng/table';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';

@Component({
  selector: 'app-receipt-approval',
  standalone: true,
  imports: [MaterialModule,CommonModule, StepperModule, TableModule, ButtonModule, ButtonGroupModule, 
    LottieAnimationComponent,InputTextModule, InputIconModule,IconFieldModule, FormsModule,
    FileUploadModule,DatePickerModule,InputNumberModule, ToastModule, ReactiveFormsModule, TextareaModule,
    FluidModule, TooltipModule, DialogModule, InputTextModule,ConfirmPopupModule],
  providers:[MessageService, ConfirmationService],
  templateUrl: './receipt-approval.component.html',
  styleUrl: './receipt-approval.component.scss'
})

export class ReceiptApprovalComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('dt') dt!: Table;

  activeStep:number = 1;
  receipts:DeliveryReceipt[]=[];
  filteredReceipts:DeliveryReceipt[]=[];

  searchValue:string='';

  showReceiptModal:boolean = false;

  form = new FormGroup({
    notes:  new FormControl(''),
    files:  new FormControl<any>(null,[ Validators.required]), // You can later manage file upload logic in the component
  });

  isLoading: boolean = false;

  constructor(
    private router:Router,
    private requisitionService:RequisitionService,
    private confirmationService:ConfirmationService,
    private dialog: MatDialog,
    private messageService:MessageService,
    private pdfService:PdfGeneratorService,
    private deliveryService:DeliveryReceiptService,
    private purchaseOrderService: PurchaseOrderService){}

  ngOnInit(): void {
    this.fetchItems();
  }
  
   async viewChecklist(item: DeliveryReceipt) {
    console.log('viewChecklist called with item:', item);

    // --- Fix Start ---
    // 1. Check if purchase_order exists on the item
    if (!item.purchase_order) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Delivery receipt is not linked to a Purchase Order.' 
      });
      console.error('Delivery receipt missing purchase_order ID:', item.id);
      return;
    }

    // 2. Fetch the Purchase Order using item.purchase_order
    console.log('Fetching purchase order with ID:', item.purchase_order);
    const purchaseOrderWithItems = await this.purchaseOrderService.getPurchaseOrderWithItems(item.purchase_order);
    console.log('Purchase order data fetched:', purchaseOrderWithItems);

    if (!purchaseOrderWithItems || !purchaseOrderWithItems.purchaseOrder) {
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Could not find Purchase Order data for this receipt.' 
        });
        console.error('Could not find Purchase Order data for PO ID:', item.purchase_order);
        return;
    }

    const purchaseOrder = purchaseOrderWithItems.purchaseOrder;

    // 3. Check if the Purchase Order has a requisition ID (assuming it's called 'requisitionId')
    // *** You might need to adjust 'requisitionId' based on your actual PurchaseOrder model ***
    const requisitionId = (purchaseOrder as any).requisitionId; // Adjust 'requisitionId' if needed
    if (!requisitionId) {
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Purchase Order is not linked to a Requisition.' 
        });
        console.error('Purchase Order missing requisitionId:', purchaseOrder.id);
        return;
    }

    // 4. Fetch the Requisition using the ID from the Purchase Order
    console.log('Fetching requisition with ID:', requisitionId);
    const requisition = await this.requisitionService.getRequisitionById(requisitionId);
    console.log('Requisition data fetched:', requisition);
    // --- Fix End ---

    if(!requisition) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Could not find requisition data for this receipt.' 
      });
      console.error('Could not find requisition data for requisition ID:', requisitionId);
      return;
    }

    // // Next, get the purchase order with items // This is already done above
    // let purchaseOrderWithItems = null;
    // if (item.purchase_order) {
    //   console.log('Fetching purchase order with items for PO ID:', item.purchase_order); 
    //   purchaseOrderWithItems = await this.purchaseOrderService.getPurchaseOrderWithItems(item.purchase_order);
    //   console.log('Purchase order data fetched:', purchaseOrderWithItems); 
    // }

    console.log('Preparing to open ChecklistModalComponent with data:', { 
      requisition: { ...requisition }, // Use the fetched requisition
      deliveryReceipt: item,
      purchaseOrder: purchaseOrder, // Use the fetched purchaseOrder
      purchaseOrderItems: purchaseOrderWithItems.items || [] // Use items from the fetched PO
    });

    // Open the dialog with combined data
    const dialogRef = this.dialog.open(ChecklistModalComponent, {
      width: '800px',
      data: { 
        requisition: { ...requisition },
        deliveryReceipt: item,
        purchaseOrder: purchaseOrder,
        purchaseOrderItems: purchaseOrderWithItems.items || []
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      console.log('ChecklistModal closed with result:', result); // Log the result
      if (result && result.items) { // Check if result and result.items exist
        // *** FIX: Update the requisition object with the modified items from the modal ***
        requisition.products = result.items;
        requisition.lastModified = new Date(); // Also update lastModified

        console.log('Updating requisition with modified products:', requisition); // Log before update
        try {
        await this.requisitionService.updateRequisition(requisition);
            console.log('Requisition update successful'); // Log after successful update
            this.fetchItems(); // Refresh the list from the service
            // Decide which status to filter based on workflow, maybe keep 'processing'?
            const currentFilterStatus = this.activeStep === 1 ? 'processing' : 'verified'; 
            this.filterByStatus(currentFilterStatus); 
            
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: `Successfully updated receipt checklist.` 
            });
        } catch (error) {
            console.error('Error updating requisition after modal close:', error);
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Update Error', 
                detail: 'Failed to save checklist changes.' 
            });
        }
      } else {
          console.log('ChecklistModal closed without changes or invalid result.');
      }
    });
  }


  openReceiptModal(){
    this.form.reset();
    this.files = [];
    if (this.fileUpload) {
      this.fileUpload.clear(); 
    }
    this.selectedDeliveryReceipt = undefined;
    this.showReceiptModal = true;
  }

  selectedDeliveryReceipt?:DeliveryReceipt;

  openUploadReportsModal(dr: DeliveryReceipt){
    this.form.reset();
    this.files = [];
    if (this.fileUpload) {
      this.fileUpload.clear(); 
    }
    this.form.patchValue({
      files:dr.receipt_files,
      notes:dr.notes ?? '',
    })
    this.selectedDeliveryReceipt = dr;
    this.showReceiptModal = true;
  }

  filterByStatus(status:'unverified'|'processing'|'verified'){
    this.filteredReceipts = this.receipts.filter(r => r.status == status);
  }

  getSeverityFromStatus(status:'unverified'|'processing'|'verified'){
    return status == 'verified' ? 'success' : 'secondary';
  }

  files:File[] = [];
  onSelectedFiles(event:any) {
    this.files = event.currentFiles ?? [],
    this.form.patchValue({
      files: event.currentFiles,
    });
  }

  async uploadReports(){
    const dr = this.form.value;
    this.form.reset();
    this.files = [];
    if (this.fileUpload) {
      this.fileUpload.clear(); 
    }
    this.showReceiptModal = false;
    await this.deliveryService.moveToRejected(this.selectedDeliveryReceipt?.id??'#')
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully rejected receipt.` });
    await this.fetchItems();
    this.filterByStatus('processing');
    this.activeStep = 1;
    await this.fetchItems();
    this.activeStep = 1;
  }

  


  nextStep(){
    this.activeStep++;
    switch (this.activeStep) {
      case 1:
        this.filterByStatus('processing');
        break;
      case 2:
        this.filterByStatus('verified');
        break;
    }
  }
  backStep(){
    this.activeStep--;
    switch (this.activeStep) {
      case 1:
        this.filterByStatus('processing');
        break;
      case 2:
        this.filterByStatus('verified');
        break;
    }
  }

  async confirmToVerification(event: Event,receipt:DeliveryReceipt){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to submit this receipt to verified receipts?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
      },
      acceptButtonProps: {
          label: 'Confirm'
      },
      accept: async () => {
          
          // const req = await this.requisitionService.getRequisitionById(receipt.purchase_order!);
          // const allSequences = await this.requisitionService.getAllApprovalSequences();
    
          // const currentSequenceIndex = allSequences.findIndex(seq=>seq.id==req?.approvalSequenceId)
          // if(currentSequenceIndex + 1 < allSequences.length){
          //   req!.approvalSequenceId = allSequences[currentSequenceIndex + 1].id;
          //   req!.currentApprovalLevel = allSequences[currentSequenceIndex + 1].level;
          // }else{
          //   req!.approvalSequenceId = undefined;
          //   req!.currentApprovalLevel = 0;
          //   req!.approvalStatus = 'Approved'; 
          // }
          // await this.requisitionService.updateRequisition(req!);
          const requisition = await this.requisitionService.getRequisitionById(receipt.purchase_order??'#');
          if(requisition){
            if(requisition?.products.length > requisition?.products.filter(product=>product.status == 'delivered').length){
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: `Purchase Order checklist has not been cleared` });
              return;
            }
          }
          await this.deliveryService.moveToVerified(receipt.id!)
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully submitted receipt to verified receipts.` });
          await this.fetchItems();
          this.filterByStatus('verified');
          this.activeStep = 2;
      },
      reject: () => {
          
      }
    });
  }

  async generateInspectionReport(receipt: DeliveryReceipt) {
    console.log('generateInspectionReport called with receipt:', receipt);

    // --- Refactor Start ---
    // 1. Check if purchase_order exists
    if (!receipt.purchase_order) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Receipt not linked to a Purchase Order.' });
        console.error('Receipt missing purchase_order ID:', receipt.id);
        return;
    }

    // 2. Fetch Purchase Order
    console.log('Fetching PO for report:', receipt.purchase_order);
    const purchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(receipt.purchase_order);
    console.log('PO data fetched for report:', purchaseOrder);
    if (!purchaseOrder) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not find Purchase Order for this receipt.' });
        console.error('Could not find PO data for report, PO ID:', receipt.purchase_order);
        return;
    }

    // 3. Get Requisition ID from PO
    const requisitionId = purchaseOrder.requisitionId;
    if (!requisitionId) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Purchase Order is not linked to a Requisition.' });
        console.error('PO missing requisitionId for report:', purchaseOrder.id);
        return;
    }

    // 4. Fetch Requisition
    console.log('Fetching Requisition for report:', requisitionId);
    const requisition = await this.requisitionService.getRequisitionById(requisitionId);
    console.log('Requisition data fetched for report:', requisition);
    // --- Refactor End ---

    if (!requisition) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not find Requisition data for this receipt.' });
        console.error('Could not find Requisition data for report, Requisition ID:', requisitionId);
        return;
    }

    // Construct the DeliveredItem object using fetched data
    const deliveredItem: DeliveredItem = {
        id: `IAR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
        supplierName: receipt.supplier_name,
        supplierId: receipt.supplier_id,
        dateDelivered: new Date(receipt.delivery_date),
        department: receipt.department_name ?? 'N/A',
        documentUrl: '', // Or fetch relevant document URL if available
        status: 'accepted', // Assuming report generation means acceptance
        items: requisition.products.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            status: 'delivered', // All items must be delivered to reach this stage
                isDelivered: true,
            remarks: '', // Add logic for remarks if needed
            dateChecked: new Date(), // Use current date or actual check date if stored
        } as DeliveryItem)),
        totalAmount: receipt.total_amount,
        poNumber: receipt.purchase_order,
        remarks: receipt.notes ?? '', // Use receipt notes as remarks
        lastUpdated: new Date()
      };
     
    console.log('Generating PDF with DeliveredItem data:', deliveredItem);

    try {
        const blob = this.pdfService.generateInspectionReport(deliveredItem);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${deliveredItem.id}.pdf`;
        document.body.appendChild(link); // Append link to body for Firefox compatibility
      link.click();
        document.body.removeChild(link); // Clean up the link
        window.URL.revokeObjectURL(url); // Release the object URL

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Inspection Report downloaded.' });

    } catch (error) {
        console.error('Error generating PDF:', error);
        this.messageService.add({ severity: 'error', summary: 'PDF Error', detail: 'Failed to generate the inspection report.' });
    }
  }

  async confirmToReject(event: Event,id:string){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to reject this receipt?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
      },
      acceptButtonProps: {
          label: 'Confirm'
      },
      accept: async () => {
          await this.deliveryService.moveToRejected(id)
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully rejected receipt.` });
          await this.fetchItems();
          this.filterByStatus('processing');
          this.activeStep = 1;
      },
      reject: () => {
          
      }
    });
  }

  async fetchItems() {
    try {
      this.isLoading = true;
      this.receipts = await this.deliveryService.getAll();
      this.filterByStatus('processing');
    } catch (error: any) {
      console.error('Error fetching delivery receipts:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to fetch delivery receipts. Please try again later.',
        life: 5000,
        closable: true,
        key: 'fetchError'
      });
      this.receipts = [];
      this.filteredReceipts = [];
    } finally {
      this.isLoading = false;
    }
  }
}
