import { Component, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { FormControl, FormGroup, FormsModule, Validators,ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
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
import { User, UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { Warehouse, Category } from 'src/app/schema/schema';
import { warehouseData, categories } from 'src/app/schema/inventory-dummydata';
import { PurchaseOrder, PurchaseOrderService } from 'src/app/services/purchase-order.service';

// Add interface for the storage location
interface StorageLocation {
  name: string;
  officeId: string;
  capacity: number;
  id?: string;
  notes?: string;
}

@Component({
  selector: 'app-stocking',
  standalone: true,
  imports: [MaterialModule,TableModule, CommonModule, DividerModule,TabsModule,
    IconFieldModule,InputIconModule,InputTextModule, FluidModule, FormsModule,
    DialogModule,ButtonModule, ButtonGroupModule,ConfirmPopupModule, LottieAnimationComponent, 
    CarouselModule,InputNumberModule,ReactiveFormsModule, SelectModule,
    ToastModule,TooltipModule,TextareaModule,BadgeModule,OverlayBadgeModule
  ],
  providers: [ConfirmationService,MessageService],
  templateUrl: './stocking.component.html',
  styleUrl: './stocking.component.scss'
})
export class StockingComponent implements OnInit {
    drItems: DeliveryReceiptItems[] = [];  // List of purchase orders with items
    allDRItems: DeliveryReceiptItems[] = [];  // List of purchase orders with items
    // warehouses: Warehouse[] = [];
    allWarehouses: Warehouse[] = [];
    categories = categories;
    currentUser?:User;
    searchValue:string='';
    showReceipt:boolean=false;
    selectedReceipts:string[]=[];
    viewedDeliveryReceipt?: DeliveryReceipt;
    viewedPurchaseOrder?: PurchaseOrder;
    selectedItemId?: string; // To hold the selected item ID
    warehouses : Warehouse[]  = warehouseData;
    purchaseOrderItems: Stock[] = []; // Items in the purchase order
  
    // Convert warehouse data to storage locations
    storageLocations: StorageLocation[] = warehouseData.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      officeId: warehouse.building, // Using building as officeId
      capacity: 100, // Default capacity, adjust as needed
      notes: `Warehouse building: ${warehouse.building}`
    }));
  
    constructor(
      private messageService: MessageService,
      private stockService:StocksService,
      private productService:ProductsService,
      private confirmationService: ConfirmationService, 
      private warehouseService: WarehouseService,
      private userService:UserService,
      private deliveryReceiptService: DeliveryReceiptService,
      private purchaseOrderService: PurchaseOrderService,
      private route: ActivatedRoute, // Inject ActivatedRoute
      private router: Router, // Add Router for navigation
      private inventoryService: InventoryService
    ) {}
  
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.fetchItems();
        });
    }
  
    async fetchItems(){
      this.currentUser = this.userService.getUser();
      if(this.currentUser?.role == 'superadmin'){
        this.currentUser!.role = 'supply';
      }
      // Fetch all DRs with their items (including potential items from verified requisitions)
      this.allDRItems = await this.deliveryReceiptService.getAllDRItems();
      console.log("All delivery receipt items fetched:", this.allDRItems);
      
      this.warehouses = await this.warehouseService.getAll();
      this.allWarehouses = await this.warehouseService.getAll();
      
      // Filter for Stocking: Only show verified DRs that haven't been stocked yet
      this.drItems = this.allDRItems.filter(drItem => 
          drItem.deliveryReceipt.status === 'verified' && 
          !drItem.deliveryReceipt.stocked
      );
      console.log("Filtered delivery receipt items for stocking (verified & not stocked):", this.drItems);
    }
  
    // Keeping countStocked as it might be useful in the future
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
    
    async viewReceipts(receipts:string[], dr: DeliveryReceipt){
      // Store receipt images if available
      if (receipts && receipts.length > 0) {
        this.selectedReceipts = receipts;
      } else {
        // Empty array if no receipts
        this.selectedReceipts = [];
      }
      
      // Directly use the delivery receipt passed from the button click
      if (dr) {
        this.viewedDeliveryReceipt = dr;
        console.log("Using delivery receipt:", this.viewedDeliveryReceipt);
        
        // If there's a purchase order associated with this receipt, fetch it with items
        if (this.viewedDeliveryReceipt.purchase_order) {
          try {
            // Get the purchase order with its items
            const poWithItems = await this.purchaseOrderService.getPurchaseOrderWithItems(
              this.viewedDeliveryReceipt.purchase_order
            );
            
            if (poWithItems) {
              this.viewedPurchaseOrder = poWithItems.purchaseOrder;
              this.purchaseOrderItems = poWithItems.items;
              console.log("Found related purchase order with items:", poWithItems);
            } else {
              // Fallback to just the purchase order without items
              this.viewedPurchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(
                this.viewedDeliveryReceipt.purchase_order
              );
              this.purchaseOrderItems = [];
              console.log("Found related purchase order (no items):", this.viewedPurchaseOrder);
            }
          } catch (error) {
            console.error("Error fetching purchase order:", error);
            this.purchaseOrderItems = [];
          }
        } else {
          this.viewedPurchaseOrder = undefined;
          this.purchaseOrderItems = [];
        }
      } else {
        console.log("No delivery receipt provided");
        // Fallback to the first item if available
        if (this.drItems.length > 0) {
          this.viewedDeliveryReceipt = this.drItems[0]?.deliveryReceipt;
          console.log("Using first available receipt:", this.viewedDeliveryReceipt);
          
          if (this.viewedDeliveryReceipt?.purchase_order) {
            const poWithItems = await this.purchaseOrderService.getPurchaseOrderWithItems(
              this.viewedDeliveryReceipt.purchase_order
            );
            
            if (poWithItems) {
              this.viewedPurchaseOrder = poWithItems.purchaseOrder;
              this.purchaseOrderItems = poWithItems.items;
            } else {
              this.viewedPurchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(
                this.viewedDeliveryReceipt.purchase_order
              );
              this.purchaseOrderItems = [];
            }
          }
        } else {
          console.log("No delivery receipts available");
          this.viewedDeliveryReceipt = undefined;
          this.viewedPurchaseOrder = undefined;
          this.purchaseOrderItems = [];
        }
      }
      
      this.showReceipt = true;
    }
  
    showStockModal:boolean = false;
    selectedDeliveryReceipt?:DeliveryReceipt;
    async openAddStockModal(dr:DeliveryReceipt){
      this.selectedStock = undefined;
      this.stockForm.reset();
      this.selectedDeliveryReceipt = dr;
      this.warehouses = await this.warehouseService.getAll();
      this.showStockModal= true;
      if (this.warehouses.length > 0) {
        this.stockForm.get('storage')?.setValue(this.warehouses[0]);
      }
    }
  
    selectedStock?:Stock;
    async openEditStockModal(dr:DeliveryReceipt,stock:Stock){
      this.selectedDeliveryReceipt = dr;
      this.selectedStock = stock;
      this.warehouses = await this.warehouseService.getAll();
      this.stockForm.setValue({
        name: this.selectedStock.name,
        ticker: this.selectedStock.ticker,
        price: this.selectedStock.price,
        storage: this.allWarehouses.find(w => w.id == this.selectedStock!.storage_id) ?? null,
        type: this.categories.find(category=>category.id == this.selectedStock!.product_id)??null,
        quantity: this.selectedStock.quantity,
        description: this.selectedStock.description || '' 
      })
      this.showStockModal= true;
    }
  
    closeStockModal(){
      this.selectedDeliveryReceipt = undefined;
      this.selectedStock = undefined;
      this.stockForm.reset();
      this.showStockModal= false;
    }
  
    stockForm = new FormGroup({
      name: new FormControl('', Validators.required),
      ticker: new FormControl('', Validators.required),
      storage: new FormControl<Warehouse|null>(null, Validators.required),
      type: new FormControl<Category|null>(null, Validators.required),
      price: new FormControl<number|null>(null, [Validators.required, Validators.min(0.001)]),
      quantity: new FormControl<number|null>(null, [Validators.required, Validators.min(1)]),
      description: new FormControl(''),
    });
  
    async addStock(){
      if (!this.stockForm.valid) return;
      const stockData = this.stockForm.value;
      await this.stockService.addStock({
        dr_id: this.selectedDeliveryReceipt?.receipt_number!,
        dateAdded: new Date(),
        name: stockData.name!,
        storage_id: stockData.storage?.id,
        storage_name: stockData.storage?.name,
        product_id: stockData.type?.id,
        product_name: stockData.type?.name,
        ticker: stockData.ticker!.toUpperCase(),
        price: Number(stockData.price!),
        quantity: Number(stockData.quantity!),
        description: stockData.description ?? undefined,
      })
      this.stockForm.reset();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added stock to Receipt No. ${this.selectedDeliveryReceipt?.id}` });
      this.closeStockModal()
      await this.fetchItems();
    }
  
    async editStock(){
      if (!this.stockForm.valid) return;
      const stockData = this.stockForm.value;
      await this.stockService.editStock({
        id: this.selectedStock!.id,
        dr_id: this.selectedStock!.dr_id,
        dateAdded: this.selectedStock!.dateAdded,
        name: stockData.name!,
        storage_id: stockData.storage?.id,
        storage_name: stockData.storage?.name,
        product_id: stockData.type?.id,
        product_name: stockData.type?.name,
        ticker: stockData.ticker!.toUpperCase(),
        price: Number(stockData.price!),
        quantity: Number(stockData.quantity!),
        description: stockData.description ?? undefined,
      })
      this.stockForm.reset();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully edited stock on Receipt No. ${this.selectedDeliveryReceipt?.id}` });
      this.closeStockModal()
      await this.fetchItems();
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
        },
        reject: () => {
            
        }
    });
    }
  
    async confirmSubmit(event: Event, deliveryReceiptItem: DeliveryReceiptItems) {
        // Use the items passed directly from the DeliveryReceiptItems object
        const drStocks = deliveryReceiptItem.items; 
        const dr = deliveryReceiptItem.deliveryReceipt; // Get the DR object

        console.log(`confirmSubmit called for DR ${dr.receipt_number} with ${drStocks.length} items.`);

        if (drStocks.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No stock items found for this delivery receipt to finalize.'
            });
            return;
        }

        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want to finalize stocks for this receipt? This will add items to the inventory.',
            icon: 'pi pi-exclamation-triangle', // Corrected icon name
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Confirm'
            },
            accept: async () => {
                try {
                    // We already have drStocks, no need to fetch and filter again
                    // const stocks = await this.stockService.getAll();
                    // const drStocks = stocks.filter(stock => stock.dr_id === dr.receipt_number);
                    
                    console.log(`Processing ${drStocks.length} stock items for inventory.`);
                    
                    // Add stocks to inventory (ensure this handles potential duplicates if needed)
                    const addedItems = await this.stockService.addToInventory(drStocks, dr.id!);
                    console.log(`${addedItems.length} items processed by addToInventory.`);

                    // --- Refactor Warehouse Update --- 
                    // // Update warehouse data (Direct localStorage manipulation is brittle)
                    // const warehouseData = JSON.parse(localStorage.getItem('warehouseData') || '[]');
                    // const stocksByWarehouse = drStocks.reduce((acc, stock) => { ... }, {});
                    // warehouseData.forEach((warehouse: any) => { ... });
                    // localStorage.setItem('warehouseData', JSON.stringify(warehouseData));
                    // Instead, let WarehouseService handle updates based on adjustments
                    // --- End Refactor --- 

                    // Add warehouse adjustments (this seems correct)
                    for (const stock of drStocks) {
                        if (stock.storage_id) {
                            console.log(`Adding warehouse adjustment for item ${stock.name} in storage ${stock.storage_id}`);
                            await this.warehouseService.addWarehouseAdjustment(stock.storage_id, {
                                type: 'Stock Addition',
                                item: stock.name,
                                quantity: stock.quantity,
                                date: new Date(),
                                receipt: dr.receipt_number,
                                description: `Added from DR ${dr.receipt_number}`
                            });
                        }
                         else {
                             console.warn(`Stock item ${stock.name} (ID: ${stock.id}) is missing storage_id. Cannot add warehouse adjustment.`);
                         }
                    }
                    // --- End Warehouse Adjustment ---

                    // Mark DR as stocked
                    console.log(`Marking DR ${dr.id} as stocked.`);
                    await this.deliveryReceiptService.markAsStocked(dr.id!);
                    console.log(`DR ${dr.id} marked as stocked successfully.`);
                    
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: `Receipt No. ${dr.receipt_number.toUpperCase()} successfully stocked and ${addedItems.length} unique item types processed for inventory!` 
                    });
                    
                    // Navigate to warehouse view or refresh
                    this.confirmationService.confirm({
                        message: 'Would you like to view the Inventory items now?',
                        header: 'View Inventory Items',
                        icon: 'pi pi-info-circle',
                        accept: () => {
                            this.router.navigate(['/shared/inventory-item']);
                        },
                        reject: async () => {
                           console.log('Refreshing items after stocking...');
                           await this.fetchItems(); // Refresh the stocking list
                        }
                    });
                } catch (error) {
                    console.error('Error processing stocks:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to process stocks. Please try again.'
                    });
                }
            },
            reject: () => {
                console.log(`Stocking submission cancelled for DR ${dr.receipt_number}`);
            }
        });
    }

    // Add this method to get the items for the selected receipt
    getSelectedReceiptItems(): Stock[] {
      if (!this.viewedDeliveryReceipt) return [];
      
      const foundDr = this.drItems.find(dr => dr.deliveryReceipt.id === this.viewedDeliveryReceipt?.id);
      return foundDr ? foundDr.items : [];
    }
}
