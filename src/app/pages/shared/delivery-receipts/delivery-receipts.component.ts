import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import {  IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SupplierDetails, SupplierService } from 'src/app/services/supplier.service';
import { SelectModule } from 'primeng/select';
import { Department, DepartmentService } from 'src/app/services/departments.service';
import { Requisition, RequisitionService } from 'src/app/services/requisition.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ProgressTableComponent, ProgressTableData } from 'src/app/components/progress-table/progress-table.component';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
import { KeyFilterModule } from 'primeng/keyfilter';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PurchaseOrder } from 'src/app/services/purchase-order.service';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-delivery-receipts',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    StepperModule, 
    TableModule, 
    ButtonModule, 
    ButtonGroupModule,
    InputTextModule, 
    InputIconModule, 
    IconFieldModule, 
    FormsModule, 
    SelectModule,
    FileUploadModule, 
    DatePickerModule, 
    InputNumberModule, 
    ToastModule, 
    ReactiveFormsModule, 
    TextareaModule,
    FluidModule, 
    TooltipModule, 
    DialogModule, 
    InputTextModule, 
    ConfirmPopupModule, 
    ProgressTableComponent, 
    KeyFilterModule, 
    LottieAnimationComponent,
    RadioButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService, ConfirmationService, CurrencyPipe, DatePipe],
  templateUrl: './delivery-receipts.component.html',
  styleUrl: './delivery-receipts.component.scss'
})
export class DeliveryReceiptsComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload: FileUpload;

  isLoading: boolean = false;

  receipts:DeliveryReceipt[]=[];
  suppliers:SupplierDetails[];
  departments:Department[];
  purchaseOrders: PurchaseOrder[];

  showReceiptModal:boolean = false;

  form = new FormGroup({
    delivery_date: new FormControl('', [Validators.required]),
    receipt_number: new FormControl('', [Validators.required]),
    supplier: new FormControl<SupplierDetails|null>(null),
    supplier_tin: new FormControl(''),
    department: new FormControl<Department|null>(null),
    purchase_order: new FormControl<PurchaseOrder|null>(null),
    total_amount: new FormControl<number|null>(null, [Validators.required, Validators.min(0.001)]),
    notes: new FormControl(''),
    files: new FormControl<any>(null),
    vatType: new FormControl<'vat' | 'non-vat'>('vat', [Validators.required]),
  });

  constructor(
    private router:Router,
    private requisitionService:RequisitionService,
    private confirmationService:ConfirmationService,
    private datePipe:DatePipe,
    private currencyPipe:CurrencyPipe,
    private messageService:MessageService,
    private departmentService:DepartmentService,
    private supplierService:SupplierService,
    private pdfService:PdfGeneratorService,
    private deliveryService:DeliveryReceiptService,
    private purchaseOrderService: PurchaseOrderService
  ){}

  ngOnInit(): void {
    this.fetchItems();
    this.loadPurchaseOrders();
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

  openEditReceiptModal(dr: DeliveryReceipt){
    if (!dr) {
        console.error('Received undefined delivery receipt for editing.');
        return;
    }
    console.log('Editing receipt:', dr);
    console.log('Available suppliers:', this.suppliers);
    console.log('Available departments:', this.departments);
    console.log('Available purchase orders:', this.purchaseOrders);

    this.form.reset();
    this.files = [];
    if (this.fileUpload) {
      this.fileUpload.clear(); 
    }
    const date = dr.delivery_date.toString().split('T')[0].split('-');
    this.form.patchValue({
      files: dr.receipt_files,
      receipt_number: dr.receipt_number,
      supplier: this.suppliers.find(supplier => supplier.id == dr.supplier_id),
      department: this.departments.find(department => department.id == dr.department_id),
      purchase_order: this.purchaseOrders.find(pur => pur.id == dr.purchase_order),
      delivery_date: `${date[1]}/${date[2]}/${date[0]}`,
      total_amount: Number(dr.total_amount!),
      notes: dr.notes ?? '',
    });
    this.selectedDeliveryReceipt = dr;
    this.showReceiptModal = true;
  }


  files:File[] = [];
  onSelectedFiles(event:any) {
    this.files = event.currentFiles ?? [],
    this.form.patchValue({
      files: event.currentFiles,
    });
  }
  formatTIN(event: Event) {
    const input = (event.target as HTMLInputElement).value.replace(/-/g, ''); // Remove existing dashes
    const maxLength = 12;

    // Limit input to 12 digits
    if (input.length > maxLength) {
        return;
    }

    // Format the TIN number to 123-456-789-123
    const formattedTIN = input.replace(/(\d{3})(\d{3})(\d{3})(\d{0,3})?/, (match: string, p1: string, p2: string, p3: string, p4: string) => {
        return `${p1}-${p2}-${p3}${p4 ? '-' + p4 : ''}`;
    }).trim();

    // Ensure the formatted TIN is exactly in the format of 123-456-789-123
    const finalTIN = formattedTIN.length > 15 ? formattedTIN.slice(0, 15) : formattedTIN;

    // Update the form control value
    this.form.patchValue({
        supplier_tin: finalTIN
    });
  }

  async addReceipt(){
    if (this.form.valid) {
      const formData = this.form.value;
      const newReceipt: Omit<DeliveryReceipt, 'id'> = {
        receipt_number: formData.receipt_number!.toUpperCase(),
        supplier_name: formData.supplier?.name ?? 'Test Supplier',
        supplier_id: formData.supplier?.id ?? '00000000000000000000000000000000',
        supplier_tin: formData.supplier_tin || '000-000-000-000',
        department_id: formData.department?.id || '00000000000000000000000000000000',
        department_name: formData.department?.name || 'Test Department',
        delivery_date: new Date(formData.delivery_date || new Date()),
        total_amount: formData.total_amount || 0,
        purchase_order: formData.purchase_order?.id,
        notes: formData.notes || '',
        status: 'unverified',
        stocked: false,
        receipt_files: [],
        vatType: (formData.vatType as 'vat' | 'non-vat') || 'vat',
      };
      
      await this.deliveryService.addReceipt(newReceipt, this.files || []);
      this.form.reset();
      this.files = [];
      if (this.fileUpload) {
        this.fileUpload.clear(); 
      }
      this.showReceiptModal = false;
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added receipt no. ${formData.receipt_number?.toUpperCase()}` });
      await this.fetchItems();
      this.progressTable.activeStep = 0;
    }
  }

  async editReceipt(){
    const dr = this.form.value;
    await this.deliveryService.editReceipt({
      id: this.selectedDeliveryReceipt!.id,
      receipt_number: dr.receipt_number!.toUpperCase(),
      supplier_name: dr.supplier?.name ?? '',
      supplier_id: dr.supplier?.id ?? '',
      supplier_tin: dr.supplier_tin!,
      department_id: dr.department!.id!,
      department_name: dr.department!.name!,
      delivery_date: new Date(dr.delivery_date!),
      total_amount: dr.total_amount!,
      purchase_order: dr.purchase_order?.id,
      notes: dr.notes ?? '',
      status: 'unverified',
      stocked: false,
      receipt_files: [],
      vatType: (dr.vatType as 'vat' | 'non-vat') || 'vat',
    });
    this.form.reset();
    this.files = [];
    if (this.fileUpload) {
      this.fileUpload.clear(); 
    }
    this.showReceiptModal = false;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully edited receipt no. ${dr.receipt_number?.toUpperCase()}` });
    await this.fetchItems();
    this.progressTable.activeStep = 0;
  }


  async confirmDeleteReceipt(event: Event, dr: DeliveryReceipt) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete receipt ${dr.receipt_number}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.deliveryService.deleteReceipt(dr.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Receipt ${dr.receipt_number} deleted successfully`
          });
          await this.fetchItems();
        } catch (error) {
          console.error('Error deleting receipt:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete receipt'
          });
        }
      }
    });
  }

  async confirmForInspection(event: Event, dr: DeliveryReceipt) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to submit receipt ${dr.receipt_number} for inspection?`,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.deliveryService.moveForInspection(dr.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Receipt ${dr.receipt_number} submitted for inspection`
          });
          await this.fetchItems();
          this.progressTable.activeStep = 1; // Move to processing tab
        } catch (error) {
          console.error('Error submitting for inspection:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit receipt for inspection'
          });
        }
      }
    });
  }

  proceedToStocking() {
    console.log('Proceeding to stocking...', this.selectedDeliveryReceipt);
    if (this.selectedDeliveryReceipt) {
      console.log('Navigating to stocking with receipt number:', this.selectedDeliveryReceipt.receipt_number);
      this.router.navigate(['/supply-management/stocking'], { 
        queryParams: { selectedId: this.selectedDeliveryReceipt.receipt_number }
      });
    } else {
      console.log('No delivery receipt selected');
    }
  }

  progressTable: ProgressTableData<DeliveryReceipt, 'status'> = {
      title: 'Delivery Receipts',
      description: 'Track and manage delivery receipts in this section.',
      topActions: [
        {
          icon: 'pi pi-plus',
          function: ()=> this.openReceiptModal(),
          label:'Add Receipt'
        },
      ],
      columns: {
        receipt_number:'Receipt No.',
        supplier_name: 'Supplier',
        department_name: 'Department',
        delivery_date: 'Delivery Date',
        total_amount: 'Total Amount',
        notes: 'Notes'
      },
      formatters: {
        total_amount: (value: string | number | boolean | Date | string[] | undefined) => {
          if (typeof value === 'number') {
            return this.currencyPipe.transform(value.toString(), 'PHP', 'symbol', '1.2-2') ?? '';
          }
          return '';
        },
        delivery_date: (value: string | number | boolean | Date | string[] | undefined) => {
          if (value instanceof Date || typeof value === 'string') {
            return this.datePipe.transform(value, 'shortDate') ?? '';
          }
          return '';
        }
      },
      activeStep:0,
      stepField:'status',
      steps: [
       {
        id:'unverified',
        label:'Unverified',
        icon:'pi pi-inbox'
       },
       {
          id:'processing',
          label:'Processing',
          icon:'pi pi-spinner-dotted pi-spin',
       },
       {
        id:'verified',
        label:'Verified',
        icon:'pi pi-verified',
       },
      ],
      data:[],
      rowActions: [
        // Unverified
        {
          hidden: (dr:DeliveryReceipt) =>  dr.status !='unverified',
          icon:'pi pi-file-pdf',
          shape:'rounded',
          tooltip:'Click to export receipt PDF',
          function: (event:Event, dr:DeliveryReceipt)=>this.pdfService.generateDeliveryReceipt(dr)
        },
        {
          hidden: (dr:DeliveryReceipt) =>  dr.status !='unverified',
          icon:'pi pi-pencil',
          shape:'rounded',
          tooltip: 'Click to edit receipt',
          function: (event:Event, dr:DeliveryReceipt)=>this.openEditReceiptModal(dr)
        },
        {
          hidden: (dr:DeliveryReceipt) =>  dr.status !='unverified',
          icon:'pi pi-trash',
          color:'danger',
          shape:'rounded',
          tooltip: 'Click to delete receipt',
          confirmation: 'Are you sure you want to delete this receipt?',
          function: (event:Event, dr:DeliveryReceipt)=>this.confirmDeleteReceipt(event,dr)
        },
        {
          hidden: (dr:DeliveryReceipt) =>  dr.status !='unverified',
          icon:'pi pi-arrow-right',
          shape:'rounded',
          color:'success',
          tooltip: 'Click to submit this receipt for inspection',
          confirmation: 'Are you sure you want to submit this for inspection?',
          function:  (event:Event, dr:DeliveryReceipt)=>this.confirmForInspection(event,dr)
        },
        // Verified
        {
          hidden: (dr:DeliveryReceipt) => !dr.stocked || dr.status !='verified',
          disabled: (dr:DeliveryReceipt)=> true,
          icon:'pi pi-box',
          shape:'rounded',
          color:'secondary',
          tooltip: 'This receipt has already been stocked',
        },
        {
          hidden: (dr: DeliveryReceipt) => dr.stocked || dr.status !== 'verified',
          icon: 'pi pi-arrow-right',
          shape: 'rounded',
          color: 'success',
          tooltip: 'Click to proceed to stocking section',
          function: (event: Event, dr: DeliveryReceipt) => {
            this.selectedDeliveryReceipt = dr;
            this.proceedToStocking();
          }
        }
      ]
    }
  
  async fetchItems() {
    try {
      this.isLoading = true;  // Start loading
      console.log('Loading started');
      this.receipts = await this.deliveryService.getAll();
      this.progressTable.data = this.receipts;
      this.progressTable.dataLoaded = true; // Set dataLoaded to true
      this.suppliers = await firstValueFrom(this.supplierService.getAllSuppliers());
      this.departments = await this.departmentService.getAllDepartments();
      const allSequences = await this.requisitionService.getAllApprovalSequences();

      const purchaseOrders = await this.purchaseOrderService.getAll();
      this.purchaseOrders = purchaseOrders.map((req: PurchaseOrder) => {
        return {
          ...req,
        };
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch delivery receipts'
      });
    } finally {
      this.isLoading = false;  // End loading regardless of success/failure
      console.log('Loading ended');
    }
  }

  onSupplierChange(event: any) {
    const selectedSupplier = event.value;
    if (selectedSupplier && selectedSupplier.tin_number) {
      this.form.patchValue({
        supplier_tin: selectedSupplier.tin_number
      });
    }
  }

  async loadPurchaseOrders() {
    this.purchaseOrders = await this.purchaseOrderService.getAll();
  }

  onPurchaseOrderChange(event: any) {
    const selectedOrder = event.value as PurchaseOrder;
    if (selectedOrder) {
        this.form.patchValue({
            total_amount: selectedOrder.totalAmount
        });
    }
  }
}
