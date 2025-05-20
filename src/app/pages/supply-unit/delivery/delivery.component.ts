import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MessageService, ConfirmationService, FilterMatchMode, FilterService } from 'primeng/api';
import { DeliveryReceiptService, DeliveryReceiptItems } from 'src/app/services/delivery-receipt.service';
import { MaterialModule } from 'src/app/material.module';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { LottieAnimationComponent } from "../../ui-components/lottie-animation/lottie-animation.component";
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { CarouselModule } from 'primeng/carousel';
import { Table } from 'primeng/table';
import { Stock, StocksService } from 'src/app/services/stocks.service';

interface DeliveryItem {
  id?: string;
  name?: string;
  ticker?: string;
  storage_name?: string;
  product_name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  dateAdded?: Date;
}

interface DeliveryReceipt {
  id: string;
  receipt_number: string;
  supplier_name: string;
  stocked: boolean;
  hasInvoice?: boolean;
  status?: 'verified' | 'processing' | 'approved';
}

interface InvoiceForm {
  id?: string;
  invoiceNumber: string;
  supplierDetails: string;
  buyerDetails: string;
  saleDate: Date;
  paymentTerms: string;
  taxRate: number;
  items: InvoiceItem[];
  status?: 'draft' | 'final';
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmPopupModule,
    MaterialModule,
    DividerModule,
    BadgeModule,
    OverlayBadgeModule,
    
    LottieAnimationComponent,
    TooltipModule,
    DialogModule,
    CalendarModule,
    InputTextarea,
    InputNumber,
    InputText,
    CarouselModule,
  ],
  providers: [MessageService, ConfirmationService, FilterService],
  templateUrl: './delivery.component.html'
})
export class DeliveryComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  drItems: DeliveryReceiptItems[] = [];
  allDRItems: DeliveryReceiptItems[] = [];
  searchValue: string = '';
  filters: { [key: string]: any } = {};
  invoiceDialogVisible: boolean = false;
  invoiceForm: InvoiceForm = {
    invoiceNumber: '',
    supplierDetails: '',
    buyerDetails: '',
    saleDate: new Date(),
    paymentTerms: '',
    taxRate: 12, // Default tax rate
    items: []
  };

  showReceipt: boolean = false;
  selectedReceipts: string[] = [
    'assets/images/products/sample-receipt.png'
  ];

  responsiveOptions: any[] = [
    {
      breakpoint: '1300px',
      numVisible: 4
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];

  showActionColumn: boolean = true;
  currentStatus: string | null = null;

  constructor(
    private deliveryReceiptService: DeliveryReceiptService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private filterService: FilterService,
    private stockService: StocksService
  ) {
    this.initializeFilters();
    this.initializeCustomFilter();
  }

  initializeFilters() {
    this.filters = {
      'deliveryReceipt.status': { value: null, matchMode: FilterMatchMode.EQUALS }
    };
  }

  initializeCustomFilter() {
    this.filterService.register('custom-contains', (value: any, filter: string): boolean => {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }
      
      if (value === undefined || value === null) {
        return false;
      }

      const searchText = filter.toLowerCase();

      // For supplier row groups
      if (value.deliveryReceipt) {
        const receipt = value.deliveryReceipt;
        if (
          receipt.supplier_name?.toLowerCase().includes(searchText) ||
          receipt.receipt_number?.toLowerCase().includes(searchText)
        ) {
          return true;
        }
      }

      // For individual items
      if ('name' in value || 'ticker' in value) {
        const item = value as DeliveryItem;
        return (
          item.name?.toLowerCase().includes(searchText) ||
          item.ticker?.toLowerCase().includes(searchText) ||
          item.storage_name?.toLowerCase().includes(searchText) ||
          item.product_name?.toLowerCase().includes(searchText) ||
          item.description?.toLowerCase().includes(searchText) ||
          item.price?.toString().includes(searchText) ||
          item.quantity?.toString().includes(searchText) ||
          (item.dateAdded && new Date(item.dateAdded).toLocaleDateString().includes(searchText))
        ) || false;
      }

      // For items within a delivery receipt
      if (value.items && Array.isArray(value.items)) {
        return value.items.some((item: DeliveryItem) => 
          item.name?.toLowerCase().includes(searchText) ||
          item.ticker?.toLowerCase().includes(searchText) ||
          item.storage_name?.toLowerCase().includes(searchText) ||
          item.product_name?.toLowerCase().includes(searchText) ||
          item.description?.toLowerCase().includes(searchText) ||
          item.price?.toString().includes(searchText) ||
          item.quantity?.toString().includes(searchText) ||
          (item.dateAdded && new Date(item.dateAdded).toLocaleDateString().includes(searchText))
        );
      }

      return false;
    });
  }

  filterByStatus(status: string) {
    // If clicking the same status, do nothing
    if (this.currentStatus === status) {
      return;
    }
    
    this.currentStatus = status;
    this.showActionColumn = status !== 'processing';
    
    // Apply filter directly to drItems instead of using p-table's built-in filter
    if (status) {
      this.drItems = this.allDRItems.filter(item => 
        item.deliveryReceipt.stocked && 
        item.deliveryReceipt.status === status
      );
    } else {
      // If no status, show all stocked items
      this.drItems = this.allDRItems.filter(item => item.deliveryReceipt.stocked);
    }
    
    // Clear the search if any
    this.searchValue = '';
  }

  ngOnInit() {
    this.fetchDeliveryItems();
  }

  async fetchDeliveryItems() {
    try {
      this.allDRItems = await this.deliveryReceiptService.getAllDRItems();
      this.drItems = this.allDRItems.filter(dr => dr.deliveryReceipt.stocked);
      // Initialize status as verified if not set
      this.drItems.forEach(item => {
        if (!item.deliveryReceipt.status) {
          item.deliveryReceipt.status = 'verified';
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Fetching Data',
        detail: 'Failed to load delivery items.',
      });
    }
  }

  countStocked(): number {
    return this.allDRItems.filter(dr => dr.deliveryReceipt.stocked).length;
  }

  calculateItemTotal(drId: string): number {
    const dr = this.drItems.find(item => item.deliveryReceipt.id === drId);
    return dr ? dr.items.length : 0;
  }

  calculateItemPriceTotal(drId: string): number {
    const dr = this.drItems.find(item => item.deliveryReceipt.id === drId);
    return dr ? dr.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) : 0;
  }

  deliverItem(item: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Delivery Initiated',
      detail: `Item "${item.name || 'Unnamed Item'}" is being delivered.`,
    });
  }

  deliverToEndUser(receipt: DeliveryReceipt) {
    // Double check that invoice exists
    if (!receipt.hasInvoice) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invoice Required',
        detail: 'Please create an invoice before submitting for processing.',
      });
      return;
    }

    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: 'Are you sure you want to submit this for processing?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Update the status to Processing
        receipt.status = 'processing';
        
        // Update both allDRItems and drItems to reflect the change
        const drIndex = this.allDRItems.findIndex(item => 
          item.deliveryReceipt.id === receipt.id
        );
        if (drIndex !== -1) {
          this.allDRItems[drIndex].deliveryReceipt.status = 'processing';
        }

        // Filter out the processing items from the current view if we're not in processing status
        if (this.currentStatus !== 'processing') {
          this.drItems = this.drItems.filter(item => 
            item.deliveryReceipt.id !== receipt.id
          );
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Submitted for Processing',
          detail: `Items under Receipt No. ${receipt.receipt_number} have been submitted for processing.`,
        });
      }
    });
  }

  calculateSubtotal(): number {
    return this.invoiceForm.items.reduce((sum: number, item: InvoiceItem) => 
      sum + (item.quantity * item.unitPrice), 0);
  }

  // calculateTax(): number {
  //   return this.calculateSubtotal() * (this.invoiceForm.taxRate / 100);
  // }

  // calculateTotal(): number {
  //   return this.calculateSubtotal() + this.calculateTax();
  // }

  // saveInvoice() {
  //   // TODO: Implement save functionality
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'Success',
  //     detail: 'Invoice has been created successfully'
  //   });
  //   this.invoiceDialogVisible = false;
  // }

  viewReceipts(receipts: string[]) {
    this.selectedReceipts = receipts;
    this.showReceipt = true;
  }

  createSaleInvoice(po: DeliveryReceiptItems) {
    this.invoiceForm = {
      invoiceNumber: '',
      supplierDetails: po.deliveryReceipt.supplier_name,
      buyerDetails: '',
      saleDate: new Date(),
      paymentTerms: 'Net 30',
      taxRate: 12,
      items: po.items.map(item => ({
        description: item.name || '',
        quantity: item.quantity || 0,
        unitPrice: item.price || 0
      }))
    };
    
    this.invoiceDialogVisible = true;
  }

  editInvoice(po: DeliveryReceiptItems) {
    // TODO: Fetch existing invoice data if needed
    this.createSaleInvoice(po); // For now, reuse create logic
    this.invoiceDialogVisible = true;
  }

  markItemAsDelivered(item: any) {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: 'Are you sure you want to mark this item as delivered?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Update the item status
        item.status = 'delivered';
        
        this.messageService.add({
          severity: 'success',
          summary: 'Item Delivered',
          detail: `${item.name} has been marked as delivered.`
        });
      }
    });
  }
}