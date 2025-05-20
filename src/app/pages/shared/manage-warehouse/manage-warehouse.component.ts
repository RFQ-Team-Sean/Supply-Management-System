import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { CrudService } from '../../../services/crud.service';
import { Transfer, Warehouse, Position, WarehouseProduct } from '../../../schema/schema';
import { products, adjustments, warehouseData, persons, productHistory, transfers, positions } from '../../../schema/inventory-dummydata';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { WarehouseService } from '../../../services/warehouse.service';
import { MessageService } from 'primeng/api';
import { StocksService } from '../../../services/stocks.service';
import { UserService } from '../../../services/user.service';
import { DeliveryReceiptService } from '../../../services/delivery-receipt.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TabViewModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    ConfirmDialogModule // Keep this here
  ],
  providers: [ConfirmationService], // Add ConfirmationService here
  templateUrl: './manage-warehouse.component.html',
  styleUrls: ['./manage-warehouse.component.scss']
})
export class ManageWarehouseComponent implements OnInit {
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt3') dt3!: Table;

  stocks: any[] = [];
  warehouses: any[] = [];
  stores: any[] = [];
  products: any[] = [];
  adjustments: any[] = [];
  transfers: any[] = [];
  warehouseData: Warehouse[] = [];
  
  selectedWarehouse: Warehouse | null = null;
  selectedStore: any = null;
  selectedProduct: any = null;
  selectedFromWarehouse: any = null;
  selectedToWarehouse: any = null;
  selectedSortOption: any = null;
  
  selectAll: boolean = false;
  selectAllAdjustments: boolean = false;
  selectAllTransfers: boolean = false;

  currentTab: 'stock' | 'adjustment' | 'transfer' = 'stock';

  addWarehouseDialog: boolean = false;
  selectedPerson: any = null;
  persons: any[] = [];

  addTransferDialog: boolean = false;
  referenceNumber: string = '';
  searchProduct: string = '';
  notes: string = '';

  viewDialog: boolean = false;
  editDialog: boolean = false;
  
  selectedItem: any = null;

  quantityTransferred: number = 0;

  expandedRows: { [key: string]: boolean } = {};
  productHistory: any[] = [];

  warehouseName: string = '';
  building: string = '';
  selectedProducts: Array<{product: any, newProductName?: string, quantity: number}> = [];

  personName: string = '';
  personImage: string | ArrayBuffer | null = null;
  selectedPosition: any = null;
  positions: Position[] = []; // Use the Position schema

  adjustmentsDialog: boolean = false;
  showAdjustments: boolean = false;

  transferDialog: boolean = false;
  selectedTransferProduct: any = null;
  transferQuantity: number = 0;
  transferNotes: string = '';

  filteredProducts: any[] = [];

  showAdjustmentsHistory: boolean = false;
  selectedWarehouseAdjustments: any[] = [];

  availableProducts: any[] = [];

  constructor(
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private stockService: StocksService,
    private userService: UserService,
    private deliveryReceiptService: DeliveryReceiptService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const storedData = localStorage.getItem('warehouseData');
    if (storedData) {
      this.warehouseData = JSON.parse(storedData);
    } else {
      this.warehouseData = warehouseData;
      localStorage.setItem('warehouseData', JSON.stringify(this.warehouseData));
    }

    this.warehouses = this.warehouseData.map(w => ({ name: w.name, code: w.id }));
    this.products = products;
    this.positions = positions;
    this.loadAdjustments(); // Load adjustments on init
  }

  loadData() {
    this.loadTransfers();
  }

  async loadWarehouses() {
    try {
      this.warehouseData = await this.crudService.getAll(Warehouse);
      this.warehouses = this.warehouseData.map(w => ({ name: w.name, code: w.id }));
      // Force change detection
      this.warehouseData = [...this.warehouseData];
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  }

  loadTransfers() {
    this.transfers = transfers; // Ensure this is pulling from the imported transfers
    console.log('Loaded transfers:', this.transfers); // Debugging log
  }

  openNewWarehouse() {
    this.warehouseName = '';
    this.building = '';
    this.personName = '';
    this.personImage = null;
    this.selectedPosition = null;
    this.selectedProducts = [];
    this.addWarehouseDialog = true;
  }

  hideAddWarehouseDialog() {
    this.addWarehouseDialog = false;
  }

  isStockFormValid(): boolean {
    return !!(
      this.selectedWarehouse &&
      this.selectedPerson &&
      this.selectedProduct
    );
  }

  saveStock() {
    if (this.isStockFormValid()) {
      // Implement save logic here
      console.log('Saving stock:', {
        warehouse: this.selectedWarehouse,
        person: this.selectedPerson,
        product: this.selectedProduct
      });
      this.hideAddWarehouseDialog();
    }
  }

  filterStocks() {
    if (this.selectedWarehouse?.name) {
      this.warehouseData = warehouseData.filter(w => w.name === this.selectedWarehouse?.name);
    } else {
      this.warehouseData = warehouseData;
    }
    
    if (this.dt1) {
      const globalFilter = this.dt1.filters['global'];
      if (globalFilter && !Array.isArray(globalFilter)) {
        this.dt1.filterGlobal(globalFilter.value, 'contains');
      }
    }
  }

  onSelectAllChange() {
    if (this.stocks) {
      this.stocks.forEach(stock => stock.selected = this.selectAll);
    }
  }

  onRowSelect() {
    if (this.stocks) {
      this.selectAll = this.stocks.every(stock => stock.selected);
    }
  }

  filterAdjustments() {
    if (this.selectedWarehouse?.name) {
      this.warehouseData = warehouseData.filter(w => w.name === this.selectedWarehouse?.name);
    } else {
      this.warehouseData = warehouseData;
    }
  }

  onSelectAllAdjustmentsChange() {
    if (this.adjustments) {
      this.adjustments.forEach(adjustment => adjustment.selected = this.selectAllAdjustments);
    }
  }

  onAdjustmentRowSelect() {
    if (this.adjustments) {
      this.selectAllAdjustments = this.adjustments.every(adjustment => adjustment.selected);
    }
  }

  onSearch(event: any, tab: string) {
    const searchValue = event.target.value;
    switch(tab) {
      case 'stock':
        if (this.dt1) this.dt1.filterGlobal(searchValue, 'contains');
        break;
      case 'adjustment':
        if (this.dt2) this.dt2.filterGlobal(searchValue, 'contains');
        break;
      case 'transfer':
        if (this.dt3) this.dt3.filterGlobal(searchValue, 'contains');
        break;
    }
  }

  onTabChange(event: any) {
    this.currentTab = ['stock', 'adjustment', 'transfer'][event.index] as 'stock' | 'adjustment' | 'transfer';
  }

  openNewTransfer() {
    this.selectedFromWarehouse = null;
    this.selectedToWarehouse = null;
    this.selectedProduct = null;
    this.referenceNumber = '';
    this.searchProduct = '';
    this.notes = '';
    this.availableProducts = [];
    this.addTransferDialog = true;
  }

  hideAddTransferDialog() {
    this.addTransferDialog = false;
  }

  isTransferValid(): boolean {
    return !!(
      this.selectedFromWarehouse &&
      this.selectedToWarehouse &&
      this.selectedTransferProduct &&
      this.transferQuantity > 0 &&
      this.transferQuantity <= this.selectedTransferProduct.quantity &&
      this.selectedFromWarehouse.name !== this.selectedToWarehouse.name &&
      this.referenceNumber?.trim()
    );
  }

  importTransfer() {
    console.log('Importing transfer');
  }

  filterTransfers() {
    console.log('Filtering transfers', {
      fromWarehouse: this.selectedFromWarehouse,
      toWarehouse: this.selectedToWarehouse,
      sortOption: this.selectedSortOption
    });
  }

  onSelectAllTransfersChange() {
    if (this.transfers) {
      this.transfers.forEach(transfer => transfer.selected = this.selectAllTransfers);
    }
  }

  onTransferRowSelect() {
    if (this.transfers) {
      this.selectAllTransfers = this.transfers.every(transfer => transfer.selected);
    }
  }

  getImageUrl(path: string | undefined): string {
    return path || 'assets/placeholder-person.png';
  }

  async viewItem(item: any) {
    console.log('View Item Clicked:', item); // Debugging log
    try {
      // Search the warehouseData array directly
      const warehouse = this.warehouseData.find(w => w.id === item.id);
      console.log('Fetched Warehouse:', warehouse); // Debugging log

      if (warehouse) {
        this.selectedItem = {
          ...warehouse,
          person: warehouse.person ? {
            ...warehouse.person,
            image: this.getImageUrl(warehouse.person.image)
          } : null,
          products: warehouse.products.map((p: { name: string; image: string; quantity: number }) => ({
            ...p,
            image: this.getImageUrl(p.image)
          }))
        };
        this.viewDialog = true; // Open the view dialog
      } else {
        console.error('Warehouse not found for id:', item.id);
      }
    } catch (error) {
      console.error('Error loading warehouse details:', error);
    }
  }

  hideViewDialog() {
    this.viewDialog = false;
    this.selectedItem = null; // Clear the selected item
  }

  editItem(warehouse: Warehouse) {
    if (warehouse) {
      this.selectedItem = warehouse;
      this.warehouseName = warehouse.name;
      this.building = warehouse.building;

      if (warehouse.person) {
        this.personName = warehouse.person.name;
        this.selectedPosition = this.positions.find(p => p.name === warehouse.person?.position);
      } else {
        this.personName = '';
        this.selectedPosition = null;
      }

      this.selectedProducts = warehouse.products.map((p: WarehouseProduct) => ({
        product: this.products.find(prod => prod.name === p.name),
        quantity: p.quantity
      }));

      this.editDialog = true;
    }
  }

  hideEditDialog() {
    this.editDialog = false;
    this.selectedItem = null; // Clear the selected item
  }

  async updateItem() {
    if (this.isWarehouseFormValid()) {
      try {
        const updatedWarehouse = new Warehouse();
        updatedWarehouse.id = this.selectedItem.id;
        updatedWarehouse.name = this.warehouseName;
        updatedWarehouse.building = this.building;

        if (this.personName && this.selectedPosition) {
          updatedWarehouse.person = {
            id: this.selectedItem.person?.id || Date.now(),
            name: this.personName,
            image: this.selectedItem.person?.image || 'assets/placeholder-person.png',
            position: this.selectedPosition.name
          };
        } else {
          updatedWarehouse.person = null;
        }

        updatedWarehouse.products = this.selectedProducts.map(p => ({
          name: p.product.name,
          image: p.product.image || 'assets/placeholder-product.png',
          quantity: p.quantity
        }));

        // Update the warehouse in the local warehouseData array
        const index = this.warehouseData.findIndex(w => w.id === this.selectedItem.id);
        if (index !== -1) {
          this.warehouseData[index] = updatedWarehouse;
          localStorage.setItem('warehouseData', JSON.stringify(this.warehouseData));
          this.warehouses = this.warehouseData.map(w => ({ name: w.name, code: w.id }));
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Warehouse "${updatedWarehouse.name}" has been updated successfully.`
          });

          this.hideEditDialog();
        }
      } catch (error) {
        console.error('Error updating warehouse:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update the warehouse. Please try again.'
        });
      }
    }
  }

  loadAdjustments() {
    this.adjustments = adjustments; // Ensure this is pulling from the imported adjustments
    console.log('Loaded adjustments:', this.adjustments); // Debugging log
  }

  getProductHistory(warehouseId: string, productName: string) {
    return this.productHistory.filter(
      history => history.warehouseId === warehouseId && 
                 history.productName === productName
    );
  }

  addProduct() {
    this.selectedProducts.push({ product: null, newProductName: '', quantity: 0 });
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
  }

  isWarehouseFormValid(): boolean {
    return !!(
      this.warehouseName?.trim() &&
      this.building?.trim() &&
      this.personName?.trim() &&
      this.selectedPosition &&
      this.selectedProducts.length > 0 &&
      this.selectedProducts.every(p => (p.product || p.newProductName?.trim()) && p.quantity > 0)
    );
  }

  async saveWarehouse() {
    if (this.isWarehouseFormValid()) {
      try {
        const personImageStr = typeof this.personImage === 'string' 
          ? this.personImage 
          : 'assets/placeholder-person.png';

        const newWarehouse = new Warehouse();
        newWarehouse.id = `WH${Date.now()}`; // Generate a unique ID
        newWarehouse.name = this.warehouseName;
        newWarehouse.building = this.building;
        newWarehouse.person = {
          id: Date.now(),
          name: this.personName,
          image: personImageStr,
          position: this.selectedPosition.name // Save the selected position
        };

        // Process selected products
        newWarehouse.products = this.selectedProducts.map(p => {
          if (p.newProductName?.trim()) {
            const newProduct = {
              id: `PROD${Date.now()}`,
              name: p.newProductName.trim(),
              image: 'assets/placeholder-product.png'
            };
            this.products.push(newProduct); // Add to product list
            return {
              name: newProduct.name,
              image: newProduct.image,
              quantity: p.quantity
            };
          }
          return {
            name: p.product.name,
            image: p.product.image || 'assets/placeholder-product.png',
            quantity: p.quantity
          };
        });

        // Add the new warehouse to the existing warehouseData array
        this.warehouseData = [...this.warehouseData, newWarehouse];

        // Save the updated warehouseData to localStorage
        localStorage.setItem('warehouseData', JSON.stringify(this.warehouseData));

        // Reset the form and close the dialog
        this.hideAddWarehouseDialog();
      } catch (error) {
        console.error('Error saving warehouse:', error);
      }
    }
  }

  async deleteWarehouse(warehouse: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the warehouse "${warehouse.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Remove the warehouse from the local warehouseData array
          const index = this.warehouseData.findIndex(w => w.id === warehouse.id);
          if (index !== -1) {
            this.warehouseData.splice(index, 1);

            // Save the updated warehouseData to localStorage
            localStorage.setItem('warehouseData', JSON.stringify(this.warehouseData));

            // Update the dropdown options
            this.warehouses = this.warehouseData.map(w => ({ name: w.name, code: w.id }));

            this.crudService.toast({
              severity: 'success',
              summary: 'Warehouse Deleted',
              detail: `The warehouse "${warehouse.name}" has been deleted successfully.`,
            });
          } else {
            throw new Error('Warehouse not found');
          }
        } catch (error) {
          console.error('Error deleting warehouse:', error);
          this.crudService.toast({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete the warehouse. Please try again.',
          });
        }
      },
      reject: () => {
        this.crudService.toast({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Warehouse deletion was cancelled.',
        });
      },
    });
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        console.error('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.error('File size should not exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Ensure we store it as a string
        this.personImage = e.target.result as string;
      };
      reader.readAsDataURL(file); // Convert to base64 string
    }
  }

  getStockStatus(quantity: number): string {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    if (quantity <= 50) return 'Medium Stock';
    return 'In Stock';
  }

  getStockStatusClass(quantity: number): string {
    const baseClasses = 'text-xs font-medium px-2 py-1 rounded-full';
    if (quantity <= 0) return `${baseClasses} bg-red-100 text-red-800`;
    if (quantity <= 10) return `${baseClasses} bg-orange-100 text-orange-800`;
    if (quantity <= 50) return `${baseClasses} bg-yellow-100 text-yellow-800`;
    return `${baseClasses} bg-green-100 text-green-800`;
  }

  viewProductHistory(warehouseId: string, product: any) {
    const history = this.getProductHistory(warehouseId, product.name);
    // You can show this in another dialog or expand the row
    console.log('Product History:', history);
  }

  exportInventory(warehouse: any) {
    // Implement export functionality
    console.log('Exporting inventory for warehouse:', warehouse.name);
  }

  async viewWarehouseAdjustments(warehouse: Warehouse) {
    try {
      console.log('Opening adjustments for warehouse:', warehouse);
      this.selectedWarehouse = warehouse;
      
      // Initialize empty array if no adjustments exist
      const adjustments = await this.warehouseService.getWarehouseAdjustments(warehouse.id);
      this.selectedWarehouseAdjustments = adjustments;
      
      // Set product history for display
      this.productHistory = warehouse.products.map(product => ({
        warehouseId: warehouse.id,
        productName: product.name,
        date: new Date(),
        type: 'Stock Update',
        previousQty: 0,
        adjustment: product.quantity,
        newQty: product.quantity,
        notes: 'Initial stock'
      }));

      // Make sure to set both flags
      this.adjustmentsDialog = true;
      this.showAdjustmentsHistory = true;

      console.log('Adjustments loaded:', this.selectedWarehouseAdjustments);
      console.log('Product history:', this.productHistory);
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading warehouse adjustments:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load warehouse adjustments'
      });
    }
  }

  hideAdjustmentsDialog() {
    this.adjustmentsDialog = false;
    this.showAdjustmentsHistory = false;
    this.selectedWarehouse = null;
    this.selectedProduct = null;
    this.selectedWarehouseAdjustments = [];
    this.showAdjustments = false;
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.showAdjustments = true;
  }

  hideProductAdjustments() {
    this.showAdjustments = false;
    this.selectedProduct = null;
  }

  viewWarehouseTransfers(warehouse: any) {
    this.selectedFromWarehouse = warehouse;
    this.selectedToWarehouse = null;
    this.selectedTransferProduct = null;
    this.transferQuantity = 0;
    this.transferNotes = '';
    this.transferDialog = true;
  }

  hideTransferDialog() {
    this.transferDialog = false;
    this.selectedFromWarehouse = null;
    this.selectedToWarehouse = null;
    this.selectedTransferProduct = null;
  }

  selectTransferProduct(product: any) {
    this.selectedTransferProduct = product;
    this.transferQuantity = 0;
    this.transferNotes = '';
    // Generate a reference number if not provided
    this.referenceNumber = `TR${Date.now()}`;
  }

  hideTransferProductDialog() {
    this.selectedTransferProduct = null;
    this.transferQuantity = 0;
    this.transferNotes = '';
  }

  async saveTransfer() {
    if (!this.isTransferValid()) {
      return;
    }

    try {
      // Find source and destination warehouses
      const sourceWarehouse = this.warehouseData.find(w => w.name === this.selectedFromWarehouse.name);
      const destWarehouse = this.warehouseData.find(w => w.name === this.selectedToWarehouse.name);

      if (!sourceWarehouse || !destWarehouse) {
        throw new Error('Source or destination warehouse not found');
      }

      // Find the product in source warehouse
      const sourceProduct = sourceWarehouse.products.find(p => p.name === this.selectedTransferProduct.name);
      if (!sourceProduct) {
        throw new Error('Product not found in source warehouse');
      }

      // Update source warehouse quantity
      sourceProduct.quantity -= this.transferQuantity;

      // Get inventory items from localStorage
      const inventoryItemsStr = localStorage.getItem('inventory_items');
      let inventoryItems = inventoryItemsStr ? JSON.parse(inventoryItemsStr) : [];

      // Update inventory management
      // Find the item in source warehouse inventory
      const sourceInventoryItem = inventoryItems.find(
        (item: any) => item.product === this.selectedTransferProduct.name && 
                       item.warehouse === sourceWarehouse.name
      );

      if (sourceInventoryItem) {
        // Update source inventory quantity
        sourceInventoryItem.quantity -= this.transferQuantity;

        // Find or create destination inventory item
        let destInventoryItem = inventoryItems.find(
          (item: any) => item.product === this.selectedTransferProduct.name && 
                         item.warehouse === destWarehouse.name
        );

        if (destInventoryItem) {
          // Update existing destination inventory item
          destInventoryItem.quantity += this.transferQuantity;
        } else {
          // Create new inventory item for destination warehouse
          destInventoryItem = {
            ...sourceInventoryItem,
            id: `INV${Date.now()}`,
            warehouse: destWarehouse.name,
            quantity: this.transferQuantity,
            dateAdded: new Date()
          };
          inventoryItems.push(destInventoryItem);
        }

        // Remove source inventory item if quantity is 0
        if (sourceInventoryItem.quantity === 0) {
          inventoryItems = inventoryItems.filter((item: any) => item.id !== sourceInventoryItem.id);
        }

        // Save updated inventory items
        localStorage.setItem('inventory_items', JSON.stringify(inventoryItems));

        // Emit inventory update event
        const event = new CustomEvent('inventory-updated');
        window.dispatchEvent(event);
      }

      // Remove product if quantity becomes 0
      if (sourceProduct.quantity === 0) {
        sourceWarehouse.products = sourceWarehouse.products.filter(p => p.name !== this.selectedTransferProduct.name);
      }

      // Update destination warehouse
      const destProduct = destWarehouse.products.find(p => p.name === this.selectedTransferProduct.name);
      if (destProduct) {
        destProduct.quantity += this.transferQuantity;
      } else {
        // Add new product to destination warehouse
        destWarehouse.products.push({
          name: this.selectedTransferProduct.name,
          image: this.selectedTransferProduct.image || 'assets/placeholder-product.png',
          quantity: this.transferQuantity
        });
      }

      // Create transfer record
      const transfer = {
        id: `TR${Date.now()}`,
        fromWarehouse: sourceWarehouse.name,
        toWarehouse: destWarehouse.name,
        noOfProducts: 1,
        quantityTransferred: this.transferQuantity,
        refNumber: this.referenceNumber,
        date: new Date(),
        product: this.selectedTransferProduct.name
      };

      // Add transfer to history
      this.transfers.unshift(transfer);

      // Create adjustment records for both warehouses
      await this.warehouseService.addWarehouseAdjustment(sourceWarehouse.id, {
        type: 'Transfer',
        item: this.selectedTransferProduct.name,
        quantity: -this.transferQuantity,
        date: new Date(),
        description: `Transferred to ${destWarehouse.name} (Ref: ${this.referenceNumber})`
      });

      await this.warehouseService.addWarehouseAdjustment(destWarehouse.id, {
        type: 'Transfer',
        item: this.selectedTransferProduct.name,
        quantity: this.transferQuantity,
        date: new Date(),
        description: `Received from ${sourceWarehouse.name} (Ref: ${this.referenceNumber})`
      });

      // Update localStorage for warehouses
      localStorage.setItem('warehouseData', JSON.stringify(this.warehouseData));

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Transfer Successful',
        detail: `Successfully transferred ${this.transferQuantity} units of ${this.selectedTransferProduct.name}`
      });

      // Close dialogs
      this.hideTransferDialog();
      this.hideTransferProductDialog();
      
      // Force refresh warehouse data
      this.warehouseData = [...this.warehouseData];

    } catch (error) {
      console.error('Transfer error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Transfer Failed',
        detail: error instanceof Error ? error.message : 'Failed to complete transfer'
      });
    }
  }
  
  getAll(model: any): Promise<any[]> {
    if (model === Warehouse) {
      return Promise.resolve(warehouseData); // Return dummy warehouse data
    }
    if (model === Transfer) {
      return Promise.resolve(transfers); // Now properly imported
    }
    return Promise.resolve([]);
  }

  async get<T>(model: { new (): T }, id: string): Promise<T | null> {
    const data = await this.getAll(model); // Fetch all data for the model
    console.log('Data from getAll:', data); // Debugging log
    const result = data.find((item: any) => item.id === id); // Find the item by id
    console.log('Result from get:', result); // Debugging log
    return result || null; // Return the result or null if not found
  }

  filterProducts(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }

  toggleProductHistory(product: WarehouseProduct) {
    if (!product.showHistory) {
      product.showHistory = true;
    } else {
      product.showHistory = false;
    }
    this.cdr.detectChanges();
  }

  onFromWarehouseChange(event: any) {
    if (event.value) {
      const warehouse = this.warehouseData.find(w => w.name === event.value.name);
      if (warehouse) {
        this.availableProducts = warehouse.products.map(p => ({
          name: p.name,
          code: p.name,
          quantity: p.quantity,
          image: p.image
        }));
      }
    } else {
      this.availableProducts = [];
    }
    this.selectedProduct = null;
    this.selectedToWarehouse = null;
  }
}
