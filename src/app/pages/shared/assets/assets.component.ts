import { Component, OnInit, signal } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { DataViewModule } from 'primeng/dataview';
import { Stock, StocksService } from 'src/app/services/stocks.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {  IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { UserService } from 'src/app/services/user.service';
import { Inventory, InventoryLocation, InventoryService } from 'src/app/services/inventory.service';
import { DialogModule } from 'primeng/dialog';
import { StockTransfer, StockTransferService } from 'src/app/services/stock-transfer.service';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [MaterialModule,DataViewModule, CommonModule, 
    LottieAnimationComponent,DialogModule, FormsModule, SelectModule, ReactiveFormsModule, InputNumberModule,
    FormsModule, SelectButtonModule, ButtonModule, TagModule, IconFieldModule, InputTextModule,InputIconModule, ToastModule],
  providers: [MessageService],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit {
  assets:Stock[]=[];
  filteredAssets = signal<any>([]);

  options = ['list', 'grid'];

  layout: 'list'|'grid' = 'grid';

  search:string = '';

  constructor(private stockService:StocksService, 
    private messageService:MessageService,
    private stockTransferService:StockTransferService,
    private userService:UserService, private inventoryService:InventoryService){}

  ngOnInit(): void {
    this.fetchItems();
  }

  filterBySearch(){
    this.filteredAssets.set(this.assets.filter(asset=>
        asset.name.toLowerCase().includes(this.search) ||
        asset.ticker.toLowerCase().includes(this.search) || 
        asset.dr_id?.toLowerCase().includes(this.search) ||
        asset.id?.toLocaleLowerCase().includes(this.search)
    ))
  }
  
  showTransferModal:boolean= false;
  selectedStock?:Stock;

  form = new FormGroup({
    location: new FormControl<InventoryLocation|null>(null, [Validators.required]),
    amount: new FormControl(0, [Validators.min(1),Validators.required])
  });

  async transfer(){
    const transfer = this.form.value;
    try{
      await this.stockTransferService.createTransfer(this.selectedStock?.id!, Number(transfer.amount), transfer.location?.id!);
      await this.fetchItems();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully requested supply transfer` });
      this.showTransferModal =false;
    }catch(e:any){
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.message });
    }
  
  }

  openRequestModal(stock:Stock){
    this.form.reset();
    this.selectedStock = stock;
    console.log(this.selectedStock?.id);
    this.showTransferModal = true;
  }
  filterInventory(){
    return this.inventories.filter(i=>i.id != this.selectedStock?.storage_id)
  }

  inventories:InventoryLocation[]=[];
  async fetchItems(){
    this.assets = await this.stockService.getAll();
    this.inventories = await this.inventoryService.getAllLocations();
    this.filteredAssets.set(this.assets);
  }

  
}
