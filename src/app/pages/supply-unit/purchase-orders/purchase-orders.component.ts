import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { PurchaseOrder, PurchaseOrderItems, PurchaseOrderService } from 'src/app/services/purchase-order.service';
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
import { OverlayBadgeModule } from 'primeng/overlaybadge';


@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [MaterialModule,TableModule, CommonModule, DividerModule,TabsModule,
    IconFieldModule,InputIconModule,InputTextModule, FluidModule, FormsModule,
    DialogModule,ButtonModule, ButtonGroupModule,ConfirmPopupModule, LottieAnimationComponent, 
    CarouselModule,InputNumberModule,ReactiveFormsModule,
    ToastModule,TooltipModule,TextareaModule,BadgeModule,OverlayBadgeModule
  ],
  providers: [ConfirmationService,MessageService],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent {
  purchaseOrders: PurchaseOrderItems[] = [];  // List of purchase orders with items
  allPurchaseOrders: PurchaseOrderItems[] = [];  // List of purchase orders with items
  searchValue:string='';
  stockTab:number=0;
  showReceipt:boolean=false;
  selectedReceipts:string[]=[
   'assets/images/products/sample-receipt.png'
  ];

  constructor(
    private messageService: MessageService,
    private stockService:StocksService,
    private confirmationService: ConfirmationService, 
    private purchaseOrderService: PurchaseOrderService) {}

  ngOnInit() {
    this.fetchItems();
  }

  generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async fetchItems(){
    // Fetch the purchase orders with items
    this.allPurchaseOrders = await this.purchaseOrderService.getAll();
    this.switchStockTab(0);
  }

  switchStockTab(tab:number){
    if(tab ==0){
      this.purchaseOrders =this.allPurchaseOrders.filter(po=>po.purchaseOrder.stocked);
    }else{
      this.purchaseOrders =this.allPurchaseOrders.filter(po=>!po.purchaseOrder.stocked);
    }
    this.stockTab = tab;
  }

  countStocked(){
    return this.allPurchaseOrders.filter(po=>po.purchaseOrder.stocked).length;
  }

  countUnstocked(){
    return this.allPurchaseOrders.filter(po=>!po.purchaseOrder.stocked).length;
  }

  // Utility method to calculate the total number of items in each group
  calculateItemTotal(purchaseOrderId: string): number {
    const purchaseOrder = this.purchaseOrders.find(order => order.purchaseOrder.id === purchaseOrderId);
    return purchaseOrder ? purchaseOrder.items.length : 0;
  }
  calculateItemPriceTotal(purchaseOrderId: string): number {
    const purchaseOrder = this.purchaseOrders.find(order => order.purchaseOrder.id === purchaseOrderId);
    return purchaseOrder ? purchaseOrder.items.reduce((acc,curr)=>acc+curr.price * curr.quantity,0) : 0;
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
    this.showReceipt = true;
  }


  showStockModal:boolean = false;
  selectedPurchaseOrder?:PurchaseOrder;
  openAddStockModal(purchase_order:PurchaseOrder){
    this.selectedStock = undefined;
    this.stockForm.reset();
    this.selectedPurchaseOrder = purchase_order;
    this.showStockModal= true;
  }

  selectedStock?:Stock;
  openEditStockModal(purchase_order:PurchaseOrder,stock:Stock){
    this.selectedPurchaseOrder = purchase_order;
    this.selectedStock = stock;
    this.stockForm.setValue({
      name: this.selectedStock.name,
      ticker: this.selectedStock.ticker,
      price: this.selectedStock.price,
      quantity: this.selectedStock.quantity,
      description: this.selectedStock.description || '' 
    })
    this.showStockModal= true;
  }


  closeStockModal(){
    this.selectedPurchaseOrder = undefined;
    this.selectedStock = undefined;
    this.stockForm.reset();
    this.showStockModal= false;
  }

  stockForm = new FormGroup({
    name: new FormControl('', Validators.required),
    ticker: new FormControl('', Validators.required),
    price: new FormControl<number|null>(null, [Validators.required, Validators.min(0.001)]),
    quantity: new FormControl<number|null>(null, [Validators.required, Validators.min(1)]),
    description: new FormControl(''),
  });

  async addStock(){
    if (!this.stockForm.valid) return;
    const stockData = this.stockForm.value;
    await this.stockService.addStock({
      dr_id: this.selectedPurchaseOrder?.id!,
      dateAdded: new Date(),
      name: stockData.name!,
      ticker: stockData.ticker!.toUpperCase(),
      price: Number(stockData.price!),
      quantity: Number(stockData.quantity!),
      description: stockData.description ?? undefined,
    })
    this.stockForm.reset();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added stock to Purchase ${this.selectedPurchaseOrder?.id}` });
    this.closeStockModal()
    await this.fetchItems();
    this.switchStockTab(1);
  }

  async editStock(){
    if (!this.stockForm.valid) return;
    const stockData = this.stockForm.value;
    await this.stockService.editStock({
      id: this.selectedStock!.id,
      dr_id: this.selectedStock!.dr_id,
      dateAdded: this.selectedStock!.dateAdded,
      name: stockData.name!,
      ticker: stockData.ticker!.toUpperCase(),
      price: Number(stockData.price!),
      quantity: Number(stockData.quantity!),
      description: stockData.description ?? undefined,
    })
    this.stockForm.reset();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully edited stock on Purchase ${this.selectedPurchaseOrder?.id}` });
    this.closeStockModal()
    await this.fetchItems();
    this.switchStockTab(1);
  }

  async confirmDeleteStock(event: Event,id:string){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this stock in this purchase?',
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

  confirmSubmit(event: Event, id:string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to finalize stocks for this purchase?',
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
            // await this.purchaseOrderService.markAsStocked(id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Purchase ${id.toUpperCase()} successfully stocked!` });
            this.fetchItems();
        },
        reject: () => {
            
        }
    });
}
}
