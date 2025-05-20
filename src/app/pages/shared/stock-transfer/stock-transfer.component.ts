import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { FormControl, FormGroup, FormsModule, Validators,ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { Stock, StocksService } from 'src/app/services/stocks.service';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge'
import { DeliveryReceipt, DeliveryReceiptItems, DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';
import { SelectModule } from 'primeng/select';
import { InventoryLocation, InventoryService } from 'src/app/services/inventory.service';
import { Product, ProductsService } from 'src/app/services/products.service';
import {toDataURL} from 'qrcode';
import {jsPDF} from 'jspdf';
import { User, UserService } from 'src/app/services/user.service';
import { DepartmentService } from 'src/app/services/departments.service';
import { StockTransferService, StockTransfer } from 'src/app/services/stock-transfer.service';
import { TagModule } from 'primeng/tag';

// First, define a type for all possible statuses
type TransferStatus = 'pending' | 'processing' | 'completed' | 'rejected';

// Update the status types
type OngoingStatus = 'preparing' | 'in_transit' | 'arrived' | 'verifying';

// Define our own interface for the component's display
interface StockTransferDisplay {
  id: string;
  stockId: string;
  itemName: string;
  itemType: string;
  amount: number;
  location: string;
  fromLocation: string;
  toLocation: string;
  remarks: string;
  status: TransferStatus;
  ongoingStatus?: OngoingStatus;
  lastUpdated?: Date;
  requestedBy: string;
  unit?: string;
  completedDate?: Date;
  receivedBy?: string;
  receivedDate?: Date;
  receiverRemarks?: string;
}

// Add these interfaces
interface StorageAvailability {
  id: string;
  name: string;
  totalCapacity: number;
  usedSpace: number;
  availableSpace: number;
}

interface AvailabilityStatus {
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary';
  label: string;
}

// First, let's define proper interfaces
interface StockFormData {
  name: string | null;
  type: any;
  quantity: number | null;
  unit: string | null;
  fromLocation: any;
  toLocation: any;
  requestedBy: any;
  remarks: string | null;
}

// First, define the proper interface for the stock item
interface StockItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  product_id?: string;
  status?: 'pending' | 'delivered' | 'Approved' | 'Rejected' | 'Pending';
  description?: string;
  unit?: string;
  from_location_id?: string;
  to_location_id?: string;
  remarks?: string;
  requestedBy?: string;
}

@Component({
  standalone: true,
  imports: [MaterialModule,TableModule, CommonModule, DividerModule,TabsModule,
    IconFieldModule,InputIconModule,InputTextModule, FluidModule, FormsModule,
    DialogModule,ButtonModule, ButtonGroupModule,ConfirmPopupModule, LottieAnimationComponent, 
    InputNumberModule,ReactiveFormsModule, SelectModule,
    ToastModule,TooltipModule,TextareaModule,BadgeModule,OverlayBadgeModule,
    TagModule
  ],
  providers: [ConfirmationService,MessageService],
  selector: 'app-stock-transfer',
  templateUrl: './stock-transfer.component.html',
  styleUrl: './stock-transfer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
    }
    
    /* Add GPU acceleration for animations */
    .cursor-pointer {
      transform: translateZ(0);
      will-change: transform;
    }
  `]
})
export class StockTransferComponent {
    @ViewChild('dt') dt!: Table;
    @ViewChild('fileInput') fileInput!: ElementRef;
    drItems: DeliveryReceiptItems[] = [];  // List of purchase orders with items
    allDRItems: DeliveryReceiptItems[] = [];  // List of purchase orders with items
    inventories: InventoryLocation[];
    allInventories:InventoryLocation[];
    products:Product[];
    stocks:Stock[]=[];
    currentUser?:User;
    searchValue:string='';
    stockTab:number=1;
    showStockModal:boolean = false;
    selectedDeliveryReceipt?:DeliveryReceipt;
  
    // Initialize with dummy data
    transfers: StockTransferDisplay[] = [
      {
        id: '1',
        stockId: 'stock1',
        itemName: 'Laptop Computer',
        itemType: 'IT Equipment',
        amount: 5,
        location: 'Main Office',
        fromLocation: 'IT Department',
        toLocation: 'HR Department',
        remarks: 'New employee equipment',
        status: 'pending',
        requestedBy: 'Sarah Wilson',
        unit: 'pcs'
      },
      {
        id: '2',
        stockId: 'stock2',
        itemName: 'Office Desk',
        itemType: 'Furniture',
        amount: 3,
        location: 'Warehouse',
        fromLocation: 'Storage Room A',
        toLocation: 'Marketing Department',
        remarks: 'Department expansion',
        status: 'pending',
        requestedBy: 'John Martinez'
      },
      {
        id: '3',
        stockId: 'stock3',
        itemName: 'Printer Paper',
        itemType: 'Office Supplies',
        amount: 50,
        location: 'Supply Room',
        fromLocation: 'Main Storage',
        toLocation: 'Finance Department',
        remarks: 'Monthly supply restock',
        status: 'pending',
        requestedBy: 'Emily Chen'
      },
      {
        id: '4',
        stockId: 'stock4',
        itemName: 'Conference Chairs',
        itemType: 'Furniture',
        amount: 12,
        location: 'Building B',
        fromLocation: 'Storage Room B',
        toLocation: 'Conference Room 301',
        remarks: 'Meeting room setup',
        status: 'pending',
        requestedBy: 'Michael Brown'
      },
      {
        id: '5',
        stockId: 'stock5',
        itemName: 'Projector',
        itemType: 'IT Equipment',
        amount: 2,
        location: 'IT Storage',
        fromLocation: 'IT Department',
        toLocation: 'Training Room',
        remarks: 'Training equipment setup',
        status: 'pending',
        requestedBy: 'Lisa Anderson'
      },
      {
        id: '6',
        stockId: 'stock6',
        itemName: 'Desktop Computer',
        itemType: 'IT Equipment',
        amount: 3,
        location: 'IT Storage',
        fromLocation: 'Main Warehouse',
        toLocation: 'Sales Department',
        remarks: 'Sales team equipment upgrade',
        status: 'processing',
        ongoingStatus: 'preparing',
        requestedBy: 'David Wilson',
        lastUpdated: new Date('2024-03-20T09:00:00')
      },
      {
        id: '7',
        stockId: 'stock7',
        itemName: 'Filing Cabinets',
        itemType: 'Furniture',
        amount: 4,
        location: 'Storage B',
        fromLocation: 'Storage B',
        toLocation: 'Legal Department',
        remarks: 'Document storage expansion',
        status: 'processing',
        ongoingStatus: 'in_transit',
        requestedBy: 'Emma Thompson',
        lastUpdated: new Date('2024-03-20T10:30:00')
      },
      {
        id: '8',
        stockId: 'stock8',
        itemName: 'Network Switch',
        itemType: 'IT Equipment',
        amount: 2,
        location: 'IT Storage',
        fromLocation: 'IT Storage',
        toLocation: 'Server Room',
        remarks: 'Network infrastructure upgrade',
        status: 'processing',
        ongoingStatus: 'arrived',
        requestedBy: 'James Chen',
        lastUpdated: new Date('2024-03-20T11:45:00')
      },
      {
        id: '9',
        stockId: 'stock9',
        itemName: 'Office Chairs',
        itemType: 'Furniture',
        amount: 10,
        location: 'Warehouse A',
        fromLocation: 'Warehouse A',
        toLocation: 'Marketing Department',
        remarks: 'New employee seating',
        status: 'processing',
        ongoingStatus: 'verifying',
        requestedBy: 'Sarah Parker',
        lastUpdated: new Date('2024-03-20T12:15:00')
      },
      {
        id: '10',
        stockId: 'stock10',
        itemName: 'Office Desk Set',
        itemType: 'Furniture',
        amount: 8,
        location: 'Main Warehouse',
        fromLocation: 'Main Warehouse',
        toLocation: 'Marketing Department',
        remarks: 'New employee workstations - Received by Maria Santos',
        status: 'completed',
        requestedBy: 'Maria Santos',
        completedDate: new Date('2024-03-18T14:30:00'),
        receivedBy: 'Maria Santos',
        receivedDate: new Date('2024-03-18T14:30:00'),
        receiverRemarks: 'All items received in good condition'
      },
      {
        id: '11',
        stockId: 'stock11',
        itemName: 'Monitors',
        itemType: 'IT Equipment',
        amount: 6,
        location: 'IT Storage',
        fromLocation: 'IT Storage',
        toLocation: 'Finance Department',
        remarks: 'Monitor upgrade for accounting team - Received by John Miller',
        status: 'completed',
        requestedBy: 'John Miller',
        completedDate: new Date('2024-03-19T11:15:00'),
        receivedBy: 'John Miller',
        receivedDate: new Date('2024-03-19T11:15:00'),
        receiverRemarks: 'All monitors tested and working properly'
      },
      {
        id: '12',
        stockId: 'stock12',
        itemName: 'Filing Cabinets',
        itemType: 'Furniture',
        amount: 4,
        location: 'Storage B',
        fromLocation: 'Storage B',
        toLocation: 'HR Department',
        remarks: 'Document storage expansion - Received by Sarah Parker',
        status: 'completed',
        requestedBy: 'Sarah Parker',
        completedDate: new Date('2024-03-19T15:45:00'),
        receivedBy: 'Sarah Parker',
        receivedDate: new Date('2024-03-19T15:45:00'),
        receiverRemarks: 'Cabinets installed in designated area'
      },
      {
        id: '13',
        stockId: 'stock13',
        itemName: 'Conference Phone System',
        itemType: 'IT Equipment',
        amount: 2,
        location: 'IT Storage',
        fromLocation: 'IT Storage',
        toLocation: 'Meeting Room 401',
        remarks: 'Meeting room communication upgrade - Received by David Chen',
        status: 'completed',
        requestedBy: 'David Chen',
        completedDate: new Date('2024-03-20T09:30:00'),
        receivedBy: 'David Chen',
        receivedDate: new Date('2024-03-20T09:30:00'),
        receiverRemarks: 'Systems tested and working perfectly'
      },
      {
        id: '14',
        stockId: 'stock14',
        itemName: 'Office Chairs',
        itemType: 'Furniture',
        amount: 10,
        location: 'Warehouse A',
        fromLocation: 'Warehouse A',
        toLocation: 'Sales Department',
        remarks: 'Ergonomic chairs for sales team - Received by Emma Thompson',
        status: 'completed',
        requestedBy: 'Emma Thompson',
        completedDate: new Date('2024-03-20T13:20:00'),
        receivedBy: 'Emma Thompson',
        receivedDate: new Date('2024-03-20T13:20:00'),
        receiverRemarks: 'All chairs assembled and distributed to team members'
      }
    ];
  
    constructor(
      private cd: ChangeDetectorRef,
      private messageService: MessageService,
      private stockService:StocksService,
      private productService:ProductsService,
      private confirmationService: ConfirmationService, 
      private departmentService:DepartmentService,
      private inventoryService: InventoryService,
      private userService:UserService,
      private stockTransferService:StockTransferService,
      private deliveryReceiptService: DeliveryReceiptService,
      private fb: FormBuilder) {
      this.initForm();
    }
  
    ngOnInit() {
      this.filterByStatus('pending');
    }
  
    generateRandomNumber(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateQR(item:Stock){
      const pdf = new jsPDF();
      let yOffset = 10; // Vertical offset for positioning the QR codes on the PDF
      let xOffset = 10; // Starting position for QR code (horizontal)
      const qrSize = 40; // Size of the QR codes in the PDF
      const maxWidth = 210; // A4 page width in mm (ISO 216 standard)
      const maxHeight = 297; // A4 page height in mm (ISO 216 standard)
      const textOffset = 5; // Space between the QR code and the text
      const id = `${item.ticker}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;

        // Generate QR code as a base64 image
        toDataURL(id, { width: qrSize, errorCorrectionLevel: 'M' }, (err: any, url: string) => {
          if (err) {
            console.error('Error generating QR code:', err);
            return;
          }

          // Add the QR code image to the PDF
          pdf.addImage(url, 'PNG', xOffset, yOffset, qrSize, qrSize); // Position and size
          const textWidth = pdf.getTextWidth(id); // Get width of the text
          const textXOffset = xOffset + (qrSize - textWidth) / 2; // Center the text beneath the QR code
          const fontSize = 8; // Font size for the text

          // Add text beneath the QR code, centered
          pdf.setFontSize(fontSize); // Set the font size
          pdf.text(id, textXOffset, yOffset + qrSize + textOffset); 

          // Update xOffset for the next QR code
          xOffset += qrSize + 10; // Add a little space between QR codes horizontally

          // If the QR code goes beyond the width of the page, move to the next row
          if (xOffset + qrSize > maxWidth) {
            xOffset = 10; // Reset xOffset to the start of the page
            yOffset += qrSize + 10; // Move to the next row
            yOffset += qrSize + textOffset + fontSize + 10; 
          }


          // Check if we need to add a new page for the QR codes
          if (yOffset + qrSize > maxHeight) {
            pdf.addPage(); // Add new page if the QR codes exceed the page height
            xOffset = 10; // Reset xOffset for new page
            yOffset = 10; // Reset yOffset for new page
          }
        });

        pdf.save(`${id}-qr-codes.pdf`);
    }

    generateQRBatch(item:Stock) {

      const remainingQR = item.quantity - (item.qrs?.length ?? 0) ;
      
      const pdf = new jsPDF();
      const textOffset = 5; 
      let yOffset = 10; // Vertical offset for positioning the QR codes on the PDF
      let xOffset = 10; // Starting position for QR code (horizontal)
      const qrSize = 40; // Size of the QR codes in the PDF
      const maxWidth = 210; // A4 page width in mm (ISO 216 standard)
      const maxHeight = 297; // A4 page height in mm (ISO 216 standard)
      const cols = Math.floor(maxWidth / qrSize); // Number of QR codes per row
      const rows = Math.floor(maxHeight / qrSize); // Number of QR codes per column
      for (let i = 0; i < remainingQR; i++) {
        const id = `${item.ticker}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
      
        // Generate QR code as a base64 image
        toDataURL(id, { width: qrSize, errorCorrectionLevel: 'M' }, (err: any, url: string) => {
          if (err) {
            console.error('Error generating QR code:', err);
            return;
          }
      
          // Add the QR code image to the PDF
          pdf.addImage(url, 'PNG', xOffset, yOffset, qrSize, qrSize); // Position and size
      
          // Calculate the width of the text and adjust xOffset for centering
          const textWidth = pdf.getTextWidth(id); // Get width of the text
          const textXOffset = xOffset + (qrSize - textWidth) / 2; // Center the text beneath the QR code
          const fontSize = 8; // Font size for the text
      
          // Set font size for the text
          pdf.setFontSize(fontSize); 
      
          // Add text beneath the QR code, centered
          pdf.text(id, textXOffset, yOffset + qrSize + textOffset); 
      
          // Update xOffset for the next QR code
          xOffset += qrSize + 10; // Add a little space between QR codes horizontally
      
          // If the QR code goes beyond the width of the page, move to the next row
          if (xOffset + qrSize > maxWidth) {
            xOffset = 10; // Reset xOffset to the start of the page
            yOffset += qrSize + 10; // Move to the next row
            yOffset += qrSize + textOffset + fontSize + 10; // Ensure space for the next QR and text
          }
      
          // Check if we need to add a new page for the QR codes
          if (yOffset + qrSize > maxHeight) {
            pdf.addPage(); // Add new page if the QR codes exceed the page height
            xOffset = 10; // Reset xOffset for new page
            yOffset = 10; // Reset yOffset for new page
          }
        });
      }
      

  
      pdf.save(`${item.ticker}-qr-codes.pdf`);
      
    }

    getStock(id:string){
      return this.stocks.find(stock => stock.id === id);
    }

    // Add new properties for both approve and reject dialogs
    showRemarksDialog = false;
    isReject = false; // To differentiate between approve and reject dialogs
    selectedTransferId: string = '';
    remarksForm = new FormGroup({
      remarks: new FormControl('', Validators.required)
    });

    async commitTransfer(id: string, event: Event) {
      event.preventDefault();
      this.selectedTransferId = id;
      this.isReject = false;
      this.showRemarksDialog = true;
      this.remarksForm.reset();
    }

    async rejectTransfer(id: string, event: Event) {
      this.selectedTransferId = id;
      this.isReject = true;
      this.showRemarksDialog = true;
    }

    async processTransfer() {
      if (!this.selectedTransferId || !this.remarksForm.valid) return;

      const transferIndex = this.transfers.findIndex(t => t.id === this.selectedTransferId);
      if (transferIndex === -1) return;
        
        if (this.isReject) {
        this.transfers[transferIndex].status = 'rejected';
          this.messageService.add({ 
          severity: 'error',
          summary: 'Transfer Rejected',
          detail: 'The transfer has been rejected'
          });
        } else {
        this.transfers[transferIndex].status = 'processing';
          this.messageService.add({ 
            severity: 'success', 
          summary: 'Transfer Ongoing',
          detail: 'The transfer is now ongoing'
        });
      }

      const remarks = this.remarksForm.get('remarks')?.value || '';
      this.transfers[transferIndex].remarks = remarks;

        this.remarksForm.reset();
      this.showRemarksDialog = false;
      this.selectedTransferId = '';
      this.isReject = false;

      this.cd.detectChanges();
    }

    closeRemarksDialog() {
      this.showRemarksDialog = false;
      this.remarksForm.reset();
    }
  
    async fetchItems(){
      try {
        console.log('Fetching items...'); 
        // Keep using dummy data instead of fetching from service for now
        console.log('Using dummy transfers:', this.transfers);
      } catch (error) {
        console.error('Error fetching items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch transfers',
          life: 3000
        });
      }
    }
  

    async markItemAsDelivered(item:Stock){
      await this.stockService.editStock({
        ...item,
        status:'delivered'
      });
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Item marked as delivered!` });
      await this.fetchItems();
      this.switchStockTab(0);
    }

    async markItemForDelivery(item:Stock){
      await this.stockService.editStock({
        ...item,
        status:'pending'
      });
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Item marked for delivery!` });
      await this.fetchItems();
      this.switchStockTab(0);
    }

    switchStockTab(tab:number){
      if(tab ==0){
        this.drItems =this.allDRItems.filter(dr=>dr.deliveryReceipt.stocked);
        if(this.currentUser?.role =='enduser'){
          this.drItems = this.drItems.filter(dr=>dr.items.find(item=>item.status));
        }
      }else{
        this.drItems =this.allDRItems.filter(dr=>!dr.deliveryReceipt.stocked);
      }
      this.stockTab = tab;
    }
  
    countStocked(){
      return this.allDRItems.filter(dr=>dr.deliveryReceipt.stocked).length;
    }
  
    countUnstocked(){
      return this.allDRItems.filter(dr=>!dr.deliveryReceipt.stocked).length;
    }
  
    // Utility method to calculate the total number of items in each group
    calculateItemTotal(drId: string): number {
      const dr = this.drItems.find(item => item.deliveryReceipt.id === drId);
      return dr ? dr.items.length : 0;
    }
    calculateItemPriceTotal(drId: string): number {
      const dr = this.drItems.find(item => item.deliveryReceipt.id === drId);
      return dr ? dr.items.reduce((acc,curr)=>acc+curr.price * curr.quantity,0) : 0;
    }
  
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
    
    
    viewReceipts(receipts:string[]){
      // this.selectedReceipts = receipts;
      this.showStockModal = true;
    }
  
  
    selectedStock: StockItem | null = null;
    async openAddStockModal(){
      this.selectedStock = null;
      this.stockForm.reset();
      this.inventories = await this.inventoryService.getLocationsOnDepartment(await this.departmentService.getOfficeDepartment(this.currentUser?.officeId!));
      this.showStockModal= true;
    }
  
    async openEditStockModal(stock: Stock) {
      this.selectedStock = stock;
      this.inventories = await this.inventoryService.getLocationsOnDepartment(await this.departmentService.getOfficeDepartment(this.currentUser?.officeId!));
      this.stockForm.setValue({
        name: this.selectedStock.name,
        type: this.products.find(product => product.id == this.selectedStock!.product_id) ?? null,
        quantity: this.selectedStock.quantity,
        fromLocation: this.inventories.find(inv => inv.id == this.selectedStock!.from_location_id) ?? null,
        toLocation: this.inventories.find(inv => inv.id == this.selectedStock!.to_location_id) ?? null,
        requestedBy: this.selectedStock?.requestedBy ? 
          this.users.find(user => user.name === this.selectedStock?.requestedBy) ?? null : null,
        remarks: this.selectedStock.remarks || ''
      });
      this.showStockModal = true;
    }
  
  
    closeStockModal() {
      this.selectedDeliveryReceipt = undefined;
      this.selectedStock = null;
      this.stockForm.reset();
      this.showStockModal = false;
    }
  
    stockForm: FormGroup;
  
    private initForm() {
      this.stockForm = this.fb.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        quantity: ['', Validators.required],
        fromLocation: ['', Validators.required],
        toLocation: ['', Validators.required],
        requestedBy: ['', Validators.required],
        remarks: ['']
      });
    }
  
    async addStock(){
      if (this.stockForm.valid) {
        const formValue = this.stockForm.value as StockFormData;
        const stockData = {
          name: formValue.name,
          product_id: formValue.type?.id,
          product_name: formValue.type?.name,
          quantity: formValue.quantity,
          from_location_id: formValue.fromLocation?.id,
          from_location_name: formValue.fromLocation?.name,
          to_location_id: formValue.toLocation?.id,
          to_location_name: formValue.toLocation?.name,
          requested_by: formValue.requestedBy?.name,
          remarks: formValue.remarks || ''
        };

        if (this.selectedStock) {
          this.updateStock(stockData);
        } else {
          this.createStock(stockData);
        }
      }
    }
  
    private createStock(stockData: any) {
      // Your create logic here
      console.log('Creating stock:', stockData);
      this.closeStockModal();
    }
  
    private updateStock(stockData: any) {
      // Your update logic here
      console.log('Updating stock:', stockData);
      this.closeStockModal();
    }
  
    async editStock(stock: StockItem) {
      this.selectedStock = stock;
      this.stockForm.patchValue({
        name: stock.name,
        type: this.products.find(product => product.id === stock.product_id) || null,
        quantity: stock.quantity,
        fromLocation: this.inventories.find(inv => inv.id === stock.from_location_id) || null,
        toLocation: this.inventories.find(inv => inv.id === stock.to_location_id) || null,
        requestedBy: this.users.find(user => user.name === stock.requestedBy) || null,
        remarks: stock.remarks || ''
      });
      this.showStockModal = true;
    }
  
    async confirmDeleteStock(event: Event,id:string){
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to delete this stock in this receipt?',
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
            await this.stockService.deleteStock(id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Stock successfully deleted!` });
            await this.fetchItems();
            this.switchStockTab(1);
        },
        reject: () => {
            
        }
    });
    }
  
    confirmSubmit(event: Event, dr:DeliveryReceipt) {
      this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'Are you sure you want to finalize stocks for this receipt?',
          icon: 'pi  pi-exclamation-triangle',
          rejectButtonProps: {
              label: 'Cancel',
              severity: 'secondary',
              outlined: true
          },
          acceptButtonProps: {
              label: 'Confirm'
          },
          accept: async () => {
              await this.deliveryReceiptService.markAsStocked(dr.id!);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: `Receipt No. ${dr.receipt_number.toUpperCase()} successfully stocked!` });
              this.fetchItems();
          },
          reject: () => {
              
          }
      });
  }

  showTransferModal = false;
  selectedTransfer?: StockTransferDisplay;

  transferForm = new FormGroup({
    amount: new FormControl<number|null>(null, [Validators.required, Validators.min(1)]),
    fromLocation: new FormControl<InventoryLocation|null>(null, Validators.required),
    toLocation: new FormControl<InventoryLocation|null>(null, Validators.required),
    remarks: new FormControl<string>('')
  });

  editTransfer(item: StockTransferDisplay) {
    if (item.status !== 'processing') {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Only processing transfers can be edited',
        life: 3000
      });
      return;
    }

    const fromLocation = this.inventories.find(inv => inv.name === item.fromLocation) || null;
    const toLocation = this.inventories.find(inv => inv.name === item.toLocation) || null;

    this.transferForm.patchValue({
      amount: item.amount,
      fromLocation: fromLocation,
      toLocation: toLocation,
      remarks: item.remarks || ''
    });

    this.selectedTransfer = item;
    this.showTransferModal = true;
  }

  async saveTransfer() {
    if (!this.transferForm.valid || !this.selectedTransfer) return;

    try {
      const formValue = this.transferForm.value;
      const transfer: StockTransfer = {
        id: this.selectedTransfer.id,
        stockId: this.selectedTransfer.stockId,
        location: this.selectedTransfer.location,
        fromLocation: formValue.fromLocation?.name || '',
        toLocation: formValue.toLocation?.name || '',
        amount: formValue.amount || 0,
        remarks: formValue.remarks || undefined,
        status: 'pending'
      };

      await this.stockTransferService.editTransfer(transfer);
      
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Transfer updated successfully',
        life: 3000
      });
      
      this.closeTransferModal();
      await this.fetchItems();
    } catch (error) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update transfer',
        life: 3000
      });
    }
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedTransfer = undefined;
    this.transferForm.reset();
  }

  downloadTransfer(item: StockTransferDisplay) {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(16);
      doc.text('Stock Transfer Details', 20, 20);
      
      // Add content
      doc.setFontSize(12);
      doc.text(`Transfer ID: ${item.id}`, 20, 40);
      doc.text(`Item Name: ${item.itemName}`, 20, 50);
      doc.text(`Item Type: ${item.itemType}`, 20, 60);
      doc.text(`Quantity: ${item.amount} ${item.unit || 'units'}`, 20, 70);
      doc.text(`From Location: ${item.fromLocation || '-'}`, 20, 80);
      doc.text(`To Location: ${item.toLocation || '-'}`, 20, 90);
      doc.text(`Status: ${item.status}`, 20, 100);
      doc.text(`Remarks: ${item.remarks || 'No remarks'}`, 20, 110);
      
      // Save the PDF
      doc.save(`stock-transfer-${item.id}.pdf`);
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Transfer document downloaded successfully',
        life: 3000
      });
    } catch (error) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to download transfer document',
        life: 3000
      });
    }
  }

  printTransfer(item: StockTransferDisplay) {
    // Create the receipt content
    const receiptContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; color: #333;">Stock Transfer Acknowledgement Receipt</h2>
          <p style="color: #666; margin: 5px 0;">Transfer ID: ${item.id}</p>
        </div>

        <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Transfer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Stock ID:</td>
              <td style="padding: 8px 0; color: #333;">${item.stockId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Item Name:</td>
              <td style="padding: 8px 0; color: #333;">${item.itemName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Type:</td>
              <td style="padding: 8px 0; color: #333;">${item.itemType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Quantity:</td>
              <td style="padding: 8px 0; color: #333;">${item.amount}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Location Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">From Location:</td>
              <td style="padding: 8px 0; color: #333;">${item.fromLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">To Location:</td>
              <td style="padding: 8px 0; color: #333;">${item.toLocation}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Completion Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Requested By:</td>
              <td style="padding: 8px 0; color: #333;">${item.requestedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Received By:</td>
              <td style="padding: 8px 0; color: #333;">${item.receivedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Received Date:</td>
              <td style="padding: 8px 0; color: #333;">${new Date(item.receivedDate!).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Remarks:</td>
              <td style="padding: 8px 0; color: #333;">${item.receiverRemarks}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 50px;">
          <div style="margin-bottom: 30px;">
            <p style="margin: 0; color: #666;">Authorized Signature:</p>
            <div style="margin-top: 25px; border-top: 1px solid #666; width: 200px;"></div>
          </div>

          <div>
            <p style="margin: 0; color: #666;">Receiver's Signature:</p>
            <div style="margin-top: 25px; border-top: 1px solid #666; width: 200px;"></div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an official acknowledgement receipt of stock transfer.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
      
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
      if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Stock Transfer Receipt - ${item.id}</title>
          </head>
          <body>
            ${receiptContent}
            <script>
              // Auto print when loaded
              window.onload = function() {
                window.print();
                // Optional: Close after printing
                // window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Show success message
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Print Started',
        detail: 'Acknowledgement receipt is ready for printing'
      });
    } else {
      // Show error if popup is blocked
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Print Failed',
        detail: 'Please allow popups to print the receipt'
      });
    }
  }

  viewDetails(item: StockTransferDisplay) {
    this.selectedTransfer = item;
    this.showDetailsDialog = true;
  }

  async completeTransfer(id: string) {
    try {
      await this.stockTransferService.completeTransfer(id);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transfer completed successfully' });
      await this.fetchItems();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to complete transfer' });
    }
  }

  prepareTransfer(item: StockTransferDisplay) {
    if (item.status !== 'processing') {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Only processing transfers can be prepared',
        life: 3000
      });
      return;
    }

    const fromLocation = this.inventories.find(inv => inv.name === item.fromLocation) || null;
    const toLocation = this.inventories.find(inv => inv.name === item.toLocation) || null;

    this.transferForm.patchValue({
      amount: item.amount,
      fromLocation: fromLocation,
      toLocation: toLocation,
      remarks: item.remarks || ''
    });

    this.selectedTransfer = item;
    this.showTransferModal = true;
  }

  viewTransfer(item: StockTransferDisplay) {
    const fromLocation = this.inventories.find(inv => inv.name === item.fromLocation) || null;
    const toLocation = this.inventories.find(inv => inv.name === item.toLocation) || null;

    this.transferForm.patchValue({
      amount: item.amount,
      fromLocation: fromLocation,
      toLocation: toLocation,
      remarks: item.remarks || ''
    });

    this.selectedTransfer = item;
    this.showTransferModal = true;
  }

  async startTransferPreparation() {
    if (this.selectedTransfer) {
      try {
        this.confirmationService.confirm({
          target: event?.target as EventTarget,
          message: 'Are you sure you want to prepare this transfer?',
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            await this.stockTransferService.prepareTransfer(this.selectedTransfer!.id);
            
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Transfer preparation started',
              life: 3000
            });
            
            this.closeTransferModal();
            await this.fetchItems(); // Refresh the table
          },
          reject: () => {
            this.messageService.add({ 
              severity: 'info', 
              summary: 'Info', 
              detail: 'Transfer preparation cancelled',
              life: 3000
            });
          }
        });
      } catch (error) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to prepare transfer',
          life: 3000
        });
      }
    }
  }

  // Add these properties to your component
  showAvailabilityModal = false;
  availabilitySearchValue = '';
  storageAvailability: StorageAvailability[] = [];
  filteredStorageAvailability: StorageAvailability[] = [];

  // Add these methods to your component
  async openAvailabilityModal() {
    await this.loadStorageAvailability();
    this.showAvailabilityModal = true;
  }

  closeAvailabilityModal() {
    this.showAvailabilityModal = false;
    this.availabilitySearchValue = '';
  }

  async loadStorageAvailability() {
    try {
      const locations = await this.inventoryService.getAllLocations();
      
      this.storageAvailability = (await Promise.all(
        locations.map(async (location) => {
          // Skip locations without an ID
          if (!location.id) return null;
          
          const usedSpace = await this.inventoryService.getUsedSpace(location.id);
          const totalCapacity = location.capacity || 100;
          const availableSpace = totalCapacity - usedSpace;
          
          return {
            id: location.id,
            name: location.name,
            totalCapacity,
            usedSpace,
            availableSpace
          };
        })
      )).filter((item): item is StorageAvailability => item !== null);
      
      this.filterAvailability();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load storage availability',
        life: 3000
      });
    }
  }

  filterAvailability() {
    if (!this.availabilitySearchValue.trim()) {
      this.filteredStorageAvailability = [...this.storageAvailability];
    } else {
      const searchTerm = this.availabilitySearchValue.toLowerCase();
      this.filteredStorageAvailability = this.storageAvailability.filter(location =>
        location.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  getAvailabilityStatus(location: StorageAvailability): AvailabilityStatus {
    const availabilityPercentage = (location.availableSpace / location.totalCapacity) * 100;
    
    if (availabilityPercentage >= 70) {
      return { severity: 'success', label: 'Available' };
    } else if (availabilityPercentage >= 30) {
      return { severity: 'warn', label: 'Limited' };
    } else {
      return { severity: 'danger', label: 'Full' };
    }
  }

  async refreshAvailability() {
    await this.loadStorageAvailability();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Storage availability updated',
      life: 3000
    });
  }

  // Add users property to component
  users: any[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' }
  ];

  // Add this property to track the current view
  currentView: 'pending' | 'processing' | 'completed' = 'pending';

  // Add this getter to check if we're in processing view
  get isProcessingView(): boolean {
    return this.currentView === 'processing';
  }

  // Add these properties to track active status and filtered data
  activeStatus: 'pending' | 'processing' | 'completed' = 'pending';
  filteredTransfers: StockTransferDisplay[] = [];

  // Optimize the filterByStatus method
  filterByStatus(status: 'pending' | 'processing' | 'completed') {
    // Update active status immediately for UI feedback
    this.activeStatus = status;
    
    // Pre-filter the data
    this.filteredTransfers = this.transfers.filter(item => item.status === status);
    
    // Update current view
    this.currentView = status;
    
    // Optional: Scroll to top of table
    if (this.dt) {
      this.dt.scrollTo({ top: 0 });
    }

    // Trigger change detection
    this.cd.detectChanges();
  }

  showDetailsDialog = false;

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedTransfer = undefined;
  }

  // Add this property for the actions column
  get showActionsColumn(): boolean {
    // Show actions column only for pending and completed items
    return this.transfers.some(item => 
      item.status === 'pending' || item.status === 'completed'
    );
  }

  // Add this to your component class if you want to show a tooltip
  getStatusTooltip(status: string): string {
    switch (status) {
      case 'processing':
        return 'Monitor ongoing transfers';
      case 'pending':
        return 'Awaiting approval';
      case 'completed':
        return 'Successfully transferred';
      default:
        return '';
    }
  }

  // Add these properties
  showTrackingDialog = false;

  // Add these methods
  getStatusSeverity(status: TransferStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: TransferStatus): string {
    switch (status) {
      case 'pending':
        return 'For Approval';
      case 'processing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  viewTracking(transfer: StockTransferDisplay) {
    this.selectedTransfer = transfer;
    this.showTrackingDialog = true;
  }

  closeTrackingDialog() {
    this.showTrackingDialog = false;
    this.selectedTransfer = undefined;
  }

  // Add these methods to handle ongoing statuses
  getOngoingStatusSeverity(status: OngoingStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'preparing':
        return 'warn';
      case 'in_transit':
        return 'info';
      case 'arrived':
        return 'success';
      case 'verifying':
        return 'secondary';
      default:
        return 'info';
    }
  }

  getOngoingStatusLabel(status: OngoingStatus): string {
    switch (status) {
      case 'preparing':
        return 'Preparing Items';
      case 'in_transit':
        return 'In Transit';
      case 'arrived':
        return 'Arrived';
      case 'verifying':
        return 'Verifying';
      default:
        return status;
    }
  }

  generatePDF(item: StockTransferDisplay) {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font styles
    doc.setFont('helvetica', 'normal');
    
    // Add company logo or header
    doc.setFontSize(20);
    doc.text('Stock Transfer Acknowledgement Receipt', 105, 20, { align: 'center' });
    
    // Add transfer ID
    doc.setFontSize(12);
    doc.text(`Transfer ID: ${item.id}`, 105, 30, { align: 'center' });
    
    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Transfer Details Section
    doc.setFontSize(14);
    doc.text('Transfer Details', 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Stock ID: ${item.stockId}`, 20, 55);
    doc.text(`Item Name: ${item.itemName}`, 20, 62);
    doc.text(`Type: ${item.itemType}`, 20, 69);
    doc.text(`Quantity: ${item.amount}`, 20, 76);
    
    // Location Information
    doc.setFontSize(14);
    doc.text('Location Information', 20, 90);
    
    doc.setFontSize(10);
    doc.text(`From Location: ${item.fromLocation}`, 20, 100);
    doc.text(`To Location: ${item.toLocation}`, 20, 107);
    
    // Completion Details
    doc.setFontSize(14);
    doc.text('Completion Details', 20, 125);
    
    doc.setFontSize(10);
    doc.text(`Requested By: ${item.requestedBy}`, 20, 135);
    doc.text(`Received By: ${item.receivedBy}`, 20, 142);
    doc.text(`Received Date: ${new Date(item.receivedDate!).toLocaleString()}`, 20, 149);
    doc.text(`Remarks: ${item.receiverRemarks}`, 20, 156);
    
    // Signature Lines
    doc.setFontSize(12);
    doc.text('Authorized Signature:', 20, 180);
    doc.line(20, 190, 80, 190);
    
    doc.text('Receiver\'s Signature:', 120, 180);
    doc.line(120, 190, 180, 190);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is an official acknowledgement receipt of stock transfer.', 105, 270, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 275, { align: 'center' });
    
    // Save the PDF
    const fileName = `Stock_Transfer_${item.id}_${new Date().getTime()}.pdf`;
    
    try {
      doc.save(fileName);
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'PDF Generated',
        detail: 'The acknowledgement receipt has been saved as PDF'
      });
    } catch (error) {
      // Show error message if PDF generation fails
      this.messageService.add({
        severity: 'error',
        summary: 'PDF Generation Failed',
        detail: 'There was an error generating the PDF'
      });
    }
  }

  itemForm = this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    quantity: ['', Validators.required],
    fromLocation: ['', Validators.required],
    toLocation: ['', Validators.required],
    requestedBy: ['', Validators.required],
    remarks: [''],
    files: [[]]
  });
}
