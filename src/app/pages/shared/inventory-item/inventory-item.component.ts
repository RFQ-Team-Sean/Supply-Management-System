import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CarouselModule } from 'primeng/carousel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import JsBarcode from 'jsbarcode';
import { Table } from 'primeng/table';
import { v4 as uuidv4 } from 'uuid';
import { CrudService } from 'src/app/services/crud.service';
import { Asset, Items, StockRequest } from 'src/app/schema/schema'; 
import { inventoryItems, categories, locations, warehouseData } from 'src/app/schema/inventory-dummydata';
import { TabViewModule } from 'primeng/tabview';
import { UserService } from 'src/app/services/user.service';
import { TagModule } from 'primeng/tag';
import { environment } from 'src/environment/environment';
import { RequestItemService } from 'src/app/services/request-item.service';
import { DepartmentService, Department } from 'src/app/services/departments.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notifications.service';

interface InventoryLocation {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

@Component({
  selector: 'app-inventory-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    DividerModule,
    ConfirmPopupModule,
    CarouselModule,
    InputNumberModule,
    DropdownModule,
    SelectModule,
    ToastModule,
    TextareaModule,
    BadgeModule,
    TabViewModule,
    TagModule
  ],
  providers: [ConfirmationService, MessageService, NotificationService],
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss'],
})
export class InventoryItemComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  inventoryItems = inventoryItems; // Load dummy data
  selectedItems: any[] = []; // Array to store selected items
  showAddItemFields: boolean = false; // Toggle Add Item fields

  requestedStocks: StockRequest[] = [];

  inventories: InventoryLocation[] = locations.map(location => ({ id: location.id, name: location.name })); // Use locations from dummy data
  products: Product[] = categories.map(category => ({ id: category.id, name: category.name })); // Use categories from dummy data

  searchValue: string = '';
  showStockModal: boolean = false;
  selectedProduct: Items | null = null;
  showDetailsModal: boolean = false;
  showEditProductModal: boolean = false;
  editProductForm: FormGroup;
  selectedWarehouse: any = null;
  filteredInventoryItems: Items[] = [];

  warehouses = warehouseData.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name
  }));

  stockForm = new FormGroup({
    requestId: new FormControl('', Validators.required),
    requesterName: new FormControl('', Validators.required),
    requesterDepartment: new FormControl('', Validators.required),
    requestDate: new FormControl(new Date()),
    priorityLevel: new FormControl('', Validators.required),
    itemName: new FormControl('', Validators.required),
    quantityRequested: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    unitOfMeasurement: new FormControl('', Validators.required),
    reasonForRequest: new FormControl(''),
    approverName: new FormControl(''),
    approvalStatus: new FormControl('Pending'),
    estimatedDeliveryDate: new FormControl<Date | null>(null),
    currentStockAvailability: new FormControl(''),
    supplierDetails: new FormControl(''),
    deliveryLocation: new FormControl('', Validators.required),
    remarks: new FormControl(''),
    requestStatus: new FormControl('Pending'),
    product: new FormControl<Items | null>(null, Validators.required),
    warehouseName: new FormControl(''), // Add this instead of storage
    categoryName: new FormControl('') // Add this instead of type
  });

  quantity: number = 1; // Initialize with a default value
  stockRequests: any[] = []; // Add this property for stock requests

  // Add property to check if user is end-user
  isEndUser: boolean = false;

  showRequestItemModal: boolean = false;

  borrowedItems: any[] = []; // List of borrowed items
  showBorrowItemModal: boolean = false;

  borrowForm = new FormGroup({
    borrowerName: new FormControl('', Validators.required),
    borrowDate: new FormControl(new Date(), Validators.required), // Ensure this is a Date object
    itemName: new FormControl('', Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    returnDate: new FormControl(new Date(), Validators.required) // Ensure this is a Date object
  });

  borrowSearchValue: string = ''; // Search input value
  filteredBorrowedItems: any[] = []; // Filtered list of borrowed items

  // Add property for departments
  departments: Department[] = [];

  // Add subscription property
  private subscription: Subscription = new Subscription();

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService,
    private userService: UserService,
    private requestItemService: RequestItemService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {
    // Get the user role from UserService
    const user = this.userService.getUser();
    this.isEndUser = user?.role === 'enduser';

    // Don't load inventory items here to avoid overwriting data
    // loadInventoryItems will be called in ngOnInit instead

    // Load departments
    this.loadDepartments();

    // Initialize the editProductForm
    this.editProductForm = new FormGroup({
      name: new FormControl('', Validators.required),
      storage_name: new FormControl('', Validators.required),
      product_name: new FormControl('', Validators.required),
      quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      description: new FormControl(''),
      minimumQty: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      unit: new FormControl(''),
      brand: new FormControl(''),
      subCategory: new FormControl(''),
      barcode: new FormControl('') // Keep barcode as readonly reference
    });

    // Initialize filtered items (these will be set properly in ngOnInit)
    this.filteredInventoryItems = [];
    this.filteredBorrowedItems = this.borrowedItems;
  }

  ngOnInit() {
    // Subscribe to request items changes to refresh inventory when items are issued
    this.subscription.add(
      this.requestItemService.requestItems$.subscribe(() => {
        // Refresh inventory when request items change (like when one is issued)
        this.loadInventoryItems();
      })
    );
    
    // Listen for inventory updates from warehouse transfers
    window.addEventListener('inventory-updated', () => {
      console.log('Received inventory update event, refreshing data...');
      this.loadInventoryItems();
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
    
    // Remove event listener
    window.removeEventListener('inventory-updated', this.loadInventoryItems);
  }

  /**
   * Loads inventory items based on the current environment
   */
  private async loadInventoryItems() {
    console.log('Loading inventory items...');
    try {
      if (environment.use === 'local') {
        console.log('Environment is set to local, checking localStorage');
        // Load from localStorage in local mode
        const storedItems = localStorage.getItem('inventory_items');
        
        if (storedItems) {
          try {
            // Parse the stored JSON
            const parsedItems = JSON.parse(storedItems);
            console.log(`Successfully loaded ${parsedItems.length} items from localStorage`);
            
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              // Process each item to ensure dates are properly converted back to Date objects
              this.inventoryItems = parsedItems.map((item: any) => {
                // Convert dateAdded from string to Date if it's a string
                if (item.dateAdded && typeof item.dateAdded === 'string') {
                  item.dateAdded = new Date(item.dateAdded);
                }
                return item;
              });
              
              console.log(`Processed ${this.inventoryItems.length} items with proper date handling`);
        } else {
              console.warn('Empty or invalid items array in localStorage, falling back to dummy data');
              // Create a deep copy of dummy data to avoid reference issues
              this.inventoryItems = JSON.parse(JSON.stringify(inventoryItems)).map((item: any) => {
                // Ensure dates are Date objects
                if (item.dateAdded) {
                  item.dateAdded = new Date(item.dateAdded);
                }
                return item;
              });
              
              // Save default dummy data to localStorage for future use
              localStorage.setItem('inventory_items', JSON.stringify(this.inventoryItems));
              console.log('Saved dummy data to localStorage');
            }
          } catch (error) {
            console.error('Error parsing inventory items from localStorage:', error);
            // Fallback to dummy data on parse error
            this.inventoryItems = JSON.parse(JSON.stringify(inventoryItems)).map((item: any) => {
              // Ensure dates are Date objects
              if (item.dateAdded) {
                item.dateAdded = new Date(item.dateAdded);
              }
              return item;
            });
            
            // Save default dummy data to localStorage for future use
            localStorage.setItem('inventory_items', JSON.stringify(this.inventoryItems));
            console.log('Saved dummy data to localStorage after parsing error');
          }
        } else {
          console.log('No items found in localStorage, using dummy data');
          // Use dummy data if no items in localStorage
          this.inventoryItems = JSON.parse(JSON.stringify(inventoryItems)).map((item: any) => {
            // Ensure dates are Date objects
            if (item.dateAdded) {
              item.dateAdded = new Date(item.dateAdded);
            }
            return item;
          });
          
          // Save default dummy data to localStorage for future use
          localStorage.setItem('inventory_items', JSON.stringify(this.inventoryItems));
          console.log(`Saved ${this.inventoryItems.length} dummy data items to localStorage`);
        }
      } else {
        // Load from server in server mode
        console.log('Environment is set to server, loading from API');
        this.inventoryItems = await this.crudService.getAll(Items);
        console.log(`Loaded ${this.inventoryItems.length} items from server`);
      }
      
      // Always update filtered items after loading
      this.filteredInventoryItems = [...this.inventoryItems];
      console.log(`Total inventory items after loading: ${this.inventoryItems.length}`);
      
      // Reset the table if it exists to refresh the data display
      if (this.dt) {
        this.dt.reset();
      }
      
      // Reset the selected warehouse filter
      this.selectedWarehouse = null;
      
      // Verify items have been loaded with proper dates
      if (this.inventoryItems.length > 0) {
        const sampleItem = this.inventoryItems[0];
        console.log('Sample item date type:', sampleItem.dateAdded instanceof Date ? 'Date object' : typeof sampleItem.dateAdded);
      }
      
      return this.inventoryItems;
    } catch (error) {
      console.error('Error loading inventory items:', error);
      // Fallback to dummy data on any error
      this.inventoryItems = JSON.parse(JSON.stringify(inventoryItems)).map((item: any) => {
        // Ensure dates are Date objects
        if (item.dateAdded) {
          item.dateAdded = new Date(item.dateAdded);
        }
        return item;
      });
      
      this.filteredInventoryItems = [...this.inventoryItems];
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load inventory items. Using default data instead.'
      });
      
      return this.inventoryItems;
    }
  }

  /**
   * Loads departments from the department service
   */
  private async loadDepartments() {
    try {
      this.departments = await this.departmentService.getAllDepartments();
    } catch (error) {
      console.error('Error loading departments:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load departments.'
      });
    }
  }

  async ngAfterViewInit() {
    // Any other initialization code can go here
  }

  openAddProductModal() {
    this.selectedProduct = null;
    this.stockForm.reset();
    
    // Generate new RIS number
    const newRISNumber = this.generateRISNumber();
    const currentDate = new Date();
    
    this.stockForm.patchValue({
      requestId: newRISNumber,
      requestDate: currentDate,
      approvalStatus: 'Pending',
      requestStatus: 'Pending',
      quantityRequested: 1
    });
    
    this.showStockModal = true;
  }

  openEditProductModal(product: Items) {
    this.selectedProduct = product;
    this.editProductForm.patchValue({
      name: product.product,
      storage_name: this.warehouses.find(w => w.name === product.warehouse),
      product_name: this.products.find(p => p.name === product.category),
      quantity: product.quantity,
      description: product.description,
      minimumQty: product.minimumQty,
      unit: product.unit,
      brand: product.brand,
      subCategory: product.subCategory,
      barcode: product.barcode // Keep for reference only
    });
    this.showEditProductModal = true;
  }

  closeStockModal() {
    this.selectedProduct = null;
    
    // Reset the form
    this.stockForm.reset();
    
    // Ensure validators are properly set for stock form
    this.stockForm.get('name')?.setValidators(Validators.required);
    this.stockForm.get('ticker')?.setValidators(Validators.required);
    this.stockForm.get('minimumQty')?.setValidators([Validators.required, Validators.min(0)]);
    this.stockForm.get('quantity')?.setValidators([Validators.required, Validators.min(1)]);
    
    // Update validators state
    this.stockForm.get('name')?.updateValueAndValidity();
    this.stockForm.get('ticker')?.updateValueAndValidity();
    this.stockForm.get('minimumQty')?.updateValueAndValidity();
    this.stockForm.get('quantity')?.updateValueAndValidity();
    
    this.showStockModal = false;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select an image file'
        });
        return;
      }
      
      // Store the file for later upload
      if (this.selectedProduct) {
        this.selectedProduct.imageFile = file;
      }
    }
  }

  async requestStock() {
    if (this.stockForm.valid) {
      try {
        const formValues = this.stockForm.value;
        const departmentObj = this.departments.find(d => d.id === formValues.requesterDepartment);

        const requestData = {
          ...formValues,
          requesterDepartment: departmentObj ? departmentObj.name : formValues.requesterDepartment,
          warehouseName: formValues.warehouseName,
          categoryName: formValues.categoryName
        };

        await this.requestItemService.createFromInventory(requestData);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Request submitted successfully'
        });

        this.closeRequestItemModal();
      } catch (error) {
        console.error('Error submitting request:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit request'
        });
      }
    }
  }

  async confirmDeleteProduct(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this product?',
      accept: async () => {
        await this.crudService.delete(Items, id);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully!' });
      }
    });
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://placehold.co/200x200?text=No+Image';
    }
  }

  viewProductDetails(product: Items) {
    this.selectedProduct = product;
    this.setEditProductForm(product);
    this.showDetailsModal = true;
  }

  printDetails() {
    // Create a new window/iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    // Get the barcode image data
    const canvas = document.getElementById('viewBarcodeCanvas') as HTMLCanvasElement;
    const barcodeImage = canvas ? canvas.toDataURL('image/png') : '';

    // Format date for display
    const formattedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get status class and text
    const getStatusClass = () => {
      if (this.selectedProduct) {
        if (this.selectedProduct.quantity === 0) return 'bg-red-100 text-red-800';
        if (this.selectedProduct.quantity < this.selectedProduct.minimumQty) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      }
      return '';
    };

    const getStatusText = () => {
      if (this.selectedProduct) {
        if (this.selectedProduct.quantity === 0) return 'Out of Stock';
        if (this.selectedProduct.quantity < this.selectedProduct.minimumQty) return 'Low Stock';
        return 'In Stock';
      }
      return '';
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Details - ${this.selectedProduct?.product || ''}</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.3;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .print-container {
              max-width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #2196F3;
            }
            .header h1 {
              margin: 0;
              color: #2196F3;
              font-size: 20px;
            }
            .date {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .barcode-section {
              text-align: center;
              margin-bottom: 15px;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .barcode-section img {
              max-height: 60px;
            }
            .barcode-label {
              font-size: 12px;
              color: #666;
              margin-top: 4px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 15px;
            }
            .info-item {
              padding: 8px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              font-size: 11px;
              color: #666;
              margin-bottom: 2px;
            }
            .info-value {
              font-size: 13px;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
            .bg-red-100 { background-color: #ffebee; }
            .text-red-800 { color: #c62828; }
            .bg-yellow-100 { background-color: #fff3e0; }
            .text-yellow-800 { color: #ef6c00; }
            .bg-green-100 { background-color: #e8f5e9; }
            .text-green-800 { color: #2e7d32; }
            .description-box {
              padding: 8px;
              background: #f8f9fa;
              border-radius: 4px;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 8px;
              position: fixed;
              bottom: 0;
              width: 100%;
            }
            @media print {
              .print-container { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <h1>Product Details</h1>
              <div class="date">${formattedDate}</div>
            </div>

            <div class="barcode-section">
              <img src="${barcodeImage}" alt="Barcode"/>
              <div class="barcode-label">Property Code: ${this.selectedProduct?.barcode || ''}</div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Product Name</div>
                <div class="info-value">${this.selectedProduct?.product || ''}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge ${getStatusClass()}">${getStatusText()}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Category</div>
                <div class="info-value">${this.selectedProduct?.category || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Sub Category</div>
                <div class="info-value">${this.selectedProduct?.subCategory || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Current Quantity</div>
                <div class="info-value">${this.selectedProduct?.quantity || '0'} ${this.selectedProduct?.unit || 'units'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Minimum Quantity</div>
                <div class="info-value">${this.selectedProduct?.minimumQty || '0'} ${this.selectedProduct?.unit || 'units'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Brand</div>
                <div class="info-value">${this.selectedProduct?.brand || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Unit of Measurement</div>
                <div class="info-value">${this.selectedProduct?.unit || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Warehouse</div>
                <div class="info-value">${this.selectedProduct?.warehouse || 'Not Assigned'}</div>
              </div>
            </div>

            <div class="description-box">
              <div class="info-label">Description</div>
              <div class="info-value">${this.selectedProduct?.description || 'No description available.'}</div>
            </div>

            <div class="footer">
              Generated on ${formattedDate} | This is a system-generated document
            </div>
          </div>
        </body>
      </html>
    `;

    // Write to the iframe
    const frameDoc = printFrame.contentWindow;
    if (frameDoc) {
      frameDoc.document.open();
      frameDoc.document.write(printContent);
      frameDoc.document.close();

      // Wait for images to load before printing
      frameDoc.onload = () => {
        try {
          frameDoc.focus();
          frameDoc.print();
        } catch (error) {
          console.error('Print failed:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to print. Please try again.'
          });
        } finally {
          // Remove the iframe after printing (or if printing fails)
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }
      };
    }
  }

  async confirmDeleteRequest(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this stock request?',
      accept: async () => {
        // Logic to delete the stock request from requestedStocks
        this.requestedStocks = this.requestedStocks.filter(request => request.requestId !== id);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock request deleted successfully!' });
      }
    });
  }

  closeEditProductModal() {
    this.showEditProductModal = false;
  }

  updateProduct() {
    if (this.editProductForm.valid) {
      const formValue = this.editProductForm.value;
      const updatedProduct: Items = {
        id: this.selectedProduct?.id || '',
        product: formValue.name,
        warehouse: formValue.storage_name ? formValue.storage_name.name : '',
        category: formValue.product_name ? formValue.product_name.name : '',
        quantity: formValue.quantity || 0,
        description: formValue.description || '',
        barcode: this.selectedProduct?.barcode || '',
        minimumQty: formValue.minimumQty || 0,
        unit: formValue.unit || '',
        status: this.selectedProduct?.status || '',
        brand: formValue.brand,
        subCategory: formValue.subCategory,
        dateAdded: this.selectedProduct?.dateAdded || new Date()
      };

      // Update the product in your data source
      const index = this.inventoryItems.findIndex(item => item.id === updatedProduct.id);
      if (index !== -1) {
        this.inventoryItems[index] = updatedProduct;
        
        // Update filtered items as well
        this.filteredInventoryItems = [...this.inventoryItems];
        
        // If in local mode, save to localStorage
        if (environment.use === 'local') {
          try {
            console.log(`Saving ${this.inventoryItems.length} items to localStorage after update`);
            localStorage.setItem('inventory_items', JSON.stringify(this.inventoryItems));
            
            // Verify the save was successful
            const savedItems = localStorage.getItem('inventory_items');
            if (savedItems) {
              const parsedItems = JSON.parse(savedItems);
              console.log(`Verified ${parsedItems.length} items in localStorage after update`);
            }
          } catch (error) {
            console.error('Error saving to localStorage after update:', error);
          }
        } else {
          // In server mode, use CRUD service
          this.crudService.update(Items, updatedProduct.id, updatedProduct);
        }
        
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully' });
        this.closeEditProductModal();
      }
    }
  }

  viewRequestDetails(request: any) {
    // Implement view request details
    console.log('View request details:', request);
  }

  approveRequest(request: any) {
    // Implement approve request
    console.log('Approve request:', request);
  }

  rejectRequest(request: any) {
    // Implement reject request
    console.log('Reject request:', request);
  }

  setEditProductForm(product: Items) {
    this.editProductForm.patchValue({
      product: product.product,
      storage_name: this.warehouses.find(w => w.name === product.warehouse) || null,
      product_name: this.products.find(prod => prod.name === product.category) || null,
      quantity: product.quantity,
      description: product.description,
      minimumQty: product.minimumQty,
      unit: product.unit,
      brand: product.brand,
      subCategory: product.subCategory,
    });
  }

  onWarehouseChange(event: any) {
    if (!event.value) {
      // If no warehouse is selected (cleared), show all items
      this.filteredInventoryItems = this.inventoryItems;
    } else {
      // Filter items by selected warehouse
      this.filteredInventoryItems = this.inventoryItems.filter(
        item => item.warehouse === event.value.name
      );
    }
    // Update the table data
    this.dt.reset();
  }

  // Updated requestItem method to use department dropdown
  requestItem(item: Items, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Set up the requestId
    this.stockForm.patchValue({
      requestId: this.generateRISNumber(),
      requestDate: new Date(),
      product: item,
      itemName: item.product,
      unitOfMeasurement: item.unit || 'pcs',
      quantityRequested: 1
    });

    // Show the add item fields section
    this.showAddItemFields = true;
    
    // Open the request item modal
    this.showRequestItemModal = true;
  }

  // Add view details method
  viewDetails(item: Items) {
    this.selectedProduct = item;
    this.showDetailsModal = true;
    
    // Generate barcode after dialog is shown
    setTimeout(() => {
        this.displayBarcode(item.barcode);
    }, 100);
  }

  // Add delete product method
  deleteProduct(event: Event, item: Items) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this product?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implement delete logic here
        const index = this.inventoryItems.findIndex(p => p.id === item.id);
        if (index > -1) {
          // Remove item from array
          this.inventoryItems.splice(index, 1);
          
          // Update filteredInventoryItems as well
          this.filteredInventoryItems = [...this.inventoryItems];
          
          // If in local mode, save to localStorage
          if (environment.use === 'local') {
            try {
              console.log(`Saving ${this.inventoryItems.length} items to localStorage after deletion`);
              localStorage.setItem('inventory_items', JSON.stringify(this.inventoryItems));
              
              // Verify the save was successful
              const savedItems = localStorage.getItem('inventory_items');
              if (savedItems) {
                const parsedItems = JSON.parse(savedItems);
                console.log(`Verified ${parsedItems.length} items in localStorage after deletion`);
              }
            } catch (error) {
              console.error('Error saving to localStorage after deletion:', error);
            }
          } else {
            // In server mode, use CRUD service
            this.crudService.delete(Items, item.id);
          }
          
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Product deleted successfully' 
          });
        }
      }
    });
  }

  // Update the method to return the correct severity type
  getStatusSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'success';
      case 'inactive':
      case 'unavailable':
        return 'danger';
      case 'low stock':
        return 'warning';
      default:
        return 'info';
    }
  }

  private generateRISNumber(): string {
    const currentYear = new Date().getFullYear();
    
    // Extract the sequence numbers from existing RIS numbers for the current year
    const maxNumber = Math.max(0, ...this.stockRequests.map(request => {
      const match = request.requestId?.match(/RIS-(\d{4})(\d{4})/);
      if (match && parseInt(match[1]) === currentYear) {
        return parseInt(match[2]);
      }
      return 0;
    }));
    
    const nextNumber = maxNumber + 1;
    return `RIS-${currentYear}${nextNumber.toString().padStart(4, '0')}`;
  }

  openRequestItemModal() {
    // Generate a new RIS number and set initial values
    const requestId = this.generateRISNumber();
    this.stockForm.patchValue({
      requestId: requestId,
      requestDate: new Date(),
      requesterName: '',
      requesterDepartment: '',
      product: null,
      quantityRequested: 1,
      unitOfMeasurement: '',
      deliveryLocation: '',
      remarks: ''
    });
    
    // Clear selected items
    this.selectedItems = [];
    
    // Hide add item section initially
    this.showAddItemFields = false;
    
    // Show the modal
    this.showRequestItemModal = true;
  }

  editProduct(item: Items) {
    this.selectedProduct = item;
    this.editProductForm.patchValue({
        name: item.product,
        barcode: item.barcode, // Use barcode as Item Code
        storage_name: this.warehouses.find(w => w.name === item.warehouse),
        product_name: this.products.find(p => p.name === item.category),
        quantity: item.quantity,
        description: item.description,
        minimumQty: item.minimumQty,
        unit: item.unit,
        brand: item.brand,
        subCategory: item.subCategory
    });
    this.showEditProductModal = true;
}

  closeRequestItemModal() {
    // Reset the form
    this.stockForm.reset();
    
    // Restore validators that were cleared for request item
    this.stockForm.get('name')?.setValidators(Validators.required);
    this.stockForm.get('ticker')?.setValidators(Validators.required);
    this.stockForm.get('minimumQty')?.setValidators([Validators.required, Validators.min(0)]);
    this.stockForm.get('quantity')?.setValidators([Validators.required, Validators.min(1)]);
    
    // Update validators state
    this.stockForm.get('name')?.updateValueAndValidity();
    this.stockForm.get('ticker')?.updateValueAndValidity();
    this.stockForm.get('minimumQty')?.updateValueAndValidity();
    this.stockForm.get('quantity')?.updateValueAndValidity();
    
    this.showRequestItemModal = false;
  }

  // Add this method to handle item selection
  onItemSelect(event: any) {
    const selectedItem = event.value;
    if (selectedItem) {
      // Set the unitOfMeasurement from the selected item
      this.stockForm.patchValue({
        unitOfMeasurement: selectedItem.unit || '',
        // Set initial quantity to 1, but ensure it respects maximum
        quantityRequested: 1
      });
      
      // Ensure quantity doesn't exceed available inventory
      const maxQuantity = selectedItem.quantity || 0;
      
      // Directly set the max attribute on the input element for immediate effect
      const inputElement = document.getElementById('quantityRequested') as HTMLInputElement;
      if (inputElement) {
        inputElement.setAttribute('max', maxQuantity.toString());
      }
      
      // Display available quantity information
      this.messageService.add({
        severity: 'info',
        summary: 'Item Selected',
        detail: `${selectedItem.product} - Available: ${maxQuantity} ${selectedItem.unit || 'units'}`
      });
    }
  }
  

  openBorrowItemModal() {
    this.borrowForm.reset();
    this.borrowForm.patchValue({
        borrowDate: new Date()
    });
    this.showBorrowItemModal = true;
}

closeBorrowItemModal() {
    this.showBorrowItemModal = false;
}

submitBorrowRequest() {
    if (this.borrowForm.valid) {
        const borrowRequest = this.borrowForm.value;
        this.borrowedItems.push({
            ...borrowRequest,
            status: 'Pending'
        });
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Borrow request submitted successfully' });
        this.closeBorrowItemModal();
    } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields' });
    }
}

viewBorrowDetails(borrowedItem: any) {
    console.log('View Borrow Details:', borrowedItem);
}

markAsReturned(borrowedItem: any) {
    borrowedItem.status = 'Returned';
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item marked as returned' });
}

filterBorrowedItems() {
    const searchValue = this.borrowSearchValue.toLowerCase();
    this.filteredBorrowedItems = this.borrowedItems.filter(item =>
        item.itemName.toLowerCase().includes(searchValue) ||
        item.borrowerName.toLowerCase().includes(searchValue) ||
        item.status.toLowerCase().includes(searchValue)
    );
}

// Simplify the refreshInventory() method
refreshInventory() {
  this.messageService.add({
    severity: 'info',
    summary: 'Refreshing Inventory',
    detail: 'Reloading inventory items...'
  });
  
  this.loadInventoryItems().then((items) => {
    // Make sure the table is reset to show the refreshed data
    if (this.dt) {
      this.dt.reset();
    }
    
    // Reset any filters or selections
    this.selectedWarehouse = null;
    this.searchValue = '';
    
    this.messageService.add({
      severity: 'success',
      summary: 'Refresh Complete',
      detail: `Successfully loaded ${items.length} inventory items`
    });
  }).catch(error => {
    this.messageService.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh inventory items. Please try again.'
    });
  });
}

// Add item to the selected items list
addItem() {
  const product = this.stockForm.get('product')?.value;
  const quantityRequested = this.stockForm.get('quantityRequested')?.value;
  const unitOfMeasurement = this.stockForm.get('unitOfMeasurement')?.value;

  if (product && quantityRequested && unitOfMeasurement) {
    // Ensure quantity doesn't exceed available inventory
    const maxQuantity = product.quantity || 0;
    
    // Final validation before adding
    let validQuantity = quantityRequested;
    if (validQuantity > maxQuantity) {
      validQuantity = maxQuantity;
      this.messageService.add({
        severity: 'warn',
        summary: 'Quantity Adjusted',
        detail: `Quantity for ${product.product} has been limited to ${maxQuantity}`
      });
    }

    // Check if this item already exists in the selectedItems array
    const existingItemIndex = this.selectedItems.findIndex(
      item => item.barcode === product.barcode
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists, but still respect maximum
      const currentQuantity = this.selectedItems[existingItemIndex].quantityRequested;
      const newTotalQuantity = currentQuantity + validQuantity;
      
      // Final check to ensure total doesn't exceed max
      if (newTotalQuantity > maxQuantity) {
        this.selectedItems[existingItemIndex].quantityRequested = maxQuantity;
        this.messageService.add({
          severity: 'warn',
          summary: 'Maximum Reached',
          detail: `Total quantity for ${product.product} has been limited to ${maxQuantity}`
        });
      } else {
        this.selectedItems[existingItemIndex].quantityRequested = newTotalQuantity;
      }
    } else {
      // Add new item to the array with validated quantity
      this.selectedItems.push({
        barcode: product.barcode,
        itemName: product.product,
        itemType: product.category,
        quantityRequested: validQuantity,
        unitOfMeasurement: unitOfMeasurement,
        product: product
      });
    }

    // Reset form for next item
    this.stockForm.patchValue({
      product: null,
      quantityRequested: 1,
      unitOfMeasurement: ''
    });
    
    // Hide the add item section
    this.showAddItemFields = false;

    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item added to request'
    });
  }
}

// Remove item from the selected items list
removeItem(item: any) {
  this.selectedItems = this.selectedItems.filter(selected => selected !== item);
  this.messageService.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Item removed successfully.'
  });
}

// Submit the request with all selected items
async submitRequestItems() {
  // Validate all items before submission
  let allItemsValid = true;
  
  // Check if any requested quantities exceed inventory
  for (const item of this.selectedItems) {
    const inventoryItem = this.inventoryItems.find(invItem => 
      invItem.product === item.itemName && invItem.barcode === item.barcode
    );
    
    if (inventoryItem && item.quantityRequested > inventoryItem.quantity) {
      allItemsValid = false;
      // Update item quantity to available quantity
      item.quantityRequested = inventoryItem.quantity;
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Quantity Adjusted',
        detail: `${item.itemName} quantity reduced to ${inventoryItem.quantity} (available inventory)`
      });
    }
  }
  
  // If quantities were adjusted, ask user to confirm before proceeding
  if (!allItemsValid) {
    this.confirmationService.confirm({
      message: 'Some requested quantities exceeded available inventory and have been adjusted. Do you want to proceed with the updated quantities?',
      accept: () => {
        this.processOriginalSubmission();
      }
    });
  } else {
    // All items valid, proceed with submission
    this.processOriginalSubmission();
  }
}

// After successfully submitting request items, in the submitRequestItems method
private async processOriginalSubmission() {
  if (this.selectedItems.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please add at least one item to submit the request.'
    });
    return;
  }

  try {
    // Get the form values we need for all items
    const formValues = this.stockForm.value;
    
    // Find the department name from ID
    const departmentObj = this.departments.find(d => d.id === formValues.requesterDepartment);
    const departmentName = departmentObj ? departmentObj.name : formValues.requesterDepartment;
    
    // Create a request with all items
    const requestData = {
      requestId: formValues.requestId,
      requesterName: formValues.requesterName,
      requesterDepartment: departmentName,
      requestDate: formValues.requestDate,
      deliveryLocation: formValues.deliveryLocation, // Address
      remarks: formValues.remarks,
      // Pass the complete items array
      items: this.selectedItems,
      // Default values
      approvalStatus: 'Pending',
      requestStatus: 'Pending',
      priorityLevel: 'Medium'
    };
    
    // Debug log the request data
    console.log('Submitting request with items:', requestData);
    console.log('Items barcode values:', this.selectedItems.map(item => ({ name: item.itemName, barcode: item.barcode })));
    
    // Call the requestItemService to create the request with all items
    const createdRequest = await this.requestItemService.createFromInventory(requestData);
    
    // Create a notification for the requester
    // This ensures they know their request was submitted
    if (formValues.requesterName) {
      this.notificationService.addNotification(
        `Your request (${formValues.requestId}) has been submitted and is now pending approval.`,
        'info',
        formValues.requesterName // Target only this user
      );
    }
    
    // Create a separate notification for administrators
    // Get all users who are admins (supply officers)
    const currentUser = this.userService.getUser();
    if (currentUser && currentUser.role !== 'enduser') {
      this.notificationService.addNotification(
        `New item request (${formValues.requestId}) from ${formValues.requesterName} (${departmentName}) requires your attention.`,
        'info',
        currentUser.username
      );
    }
     
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Request submitted successfully.'
    });
     
    // Reset the form and selected items
    this.selectedItems = [];
    this.closeRequestItemModal();
  } catch (error) {
    console.error('Error submitting request:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to submit request. Please try again.'
    });
  }
}

// Toggle the visibility of Add Item fields
toggleAddItemFields() {
  this.showAddItemFields = !this.showAddItemFields;
  
  if (this.showAddItemFields) {
    // Reset product form fields when opening the add item section
    this.stockForm.patchValue({
      product: null,
      quantityRequested: 1,
      unitOfMeasurement: ''
    });
  }
}

// Add newStockRequest to the requestedStocks array
addNewStockRequest() {
  const formValue = this.stockForm.value;
  
  const newStockRequest: StockRequest = {
    id: uuidv4(), // Generate a unique ID
    requestId: this.generateRISNumber(),
    requesterName: formValue.requesterName || '', // Add default empty string
    requesterDepartment: formValue.requesterDepartment || '', // Add default empty string
    requestDate: new Date(),
    priorityLevel: formValue.priorityLevel || 'Normal', // Add default priority
    itemName: formValue.itemName || '', // Add default empty string
    itemCode: formValue.product?.barcode || '', // Add default empty string
    quantityRequested: formValue.quantityRequested || 0, // Add default number
    unitOfMeasurement: formValue.unitOfMeasurement || '', // Add default empty string
    reasonForRequest: formValue.reasonForRequest || '', // Add default empty string
    approverName: formValue.approverName || '', // Add default empty string
    approvalStatus: 'Pending',
    estimatedDeliveryDate: formValue.estimatedDeliveryDate ? new Date(formValue.estimatedDeliveryDate) : null,
    currentStockAvailability: formValue.currentStockAvailability || '', // Add default empty string
    supplierDetails: formValue.supplierDetails || '', // Add default empty string
    deliveryLocation: formValue.deliveryLocation || '', // Add default empty string
    requestStatus: 'Pending',
    dateAdded: new Date()
  };

  // Validate required fields before adding
  if (this.validateStockRequest(newStockRequest)) {
    this.requestedStocks.push(newStockRequest);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock request added successfully'
    });
    
    return true;
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill in all required fields'
    });
    return false;
  }
}

// Add validation method
private validateStockRequest(request: StockRequest): boolean {
  return !!(
    request.requesterName &&
    request.requesterDepartment &&
    request.itemName &&
    request.itemCode &&
    request.quantityRequested > 0 &&
    request.unitOfMeasurement
  );
}

// Add this method to handle barcode display
private displayBarcode(barcodeValue: string) {
  const canvas = document.getElementById('viewBarcodeCanvas') as HTMLCanvasElement;
  if (canvas && barcodeValue) {
      JsBarcode(canvas, barcodeValue, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true
      });
  }
}

// This is just a stub to fix any references or linter errors
resetInventoryData() {
  this.messageService.add({
    severity: 'info',
    summary: 'Function Removed',
    detail: 'Reset inventory function has been removed'
  });
}

/**
 * Validates and enforces the maximum quantity value during typing
 * @param event The input event from p-inputNumber
 */
validateMaxQuantity(event: any): void {
  const selectedItem = this.stockForm.get('product')?.value;
  if (!selectedItem) return;
  
  const maxQuantity = selectedItem.quantity || 0;
  const inputValue = event.value;
  
  // If the input value exceeds the maximum, immediately replace it with the max value
  if (inputValue > maxQuantity) {
    // Set a timeout to allow Angular to complete its current cycle
    setTimeout(() => {
      this.stockForm.get('quantityRequested')?.setValue(maxQuantity);
      
      // Show a warning message
      this.messageService.add({
        severity: 'warn',
        summary: 'Maximum Exceeded',
        detail: `Quantity limited to maximum available: ${maxQuantity}`
      });
    });
  }
  
  // Another approach: directly manipulate DOM if needed
  // This helps with cases where typing continues even after validation
  const inputElement = document.getElementById('quantityRequested') as HTMLInputElement;
  if (inputElement) {
    inputElement.setAttribute('max', maxQuantity.toString());
  }
}

/**
 * Prevents user from typing values that would exceed the maximum allowed quantity
 * This method is more aggressive and will prevent keys from being entered at all
 * @param event Keyboard event
 */
preventExceedingMaxValue(event: KeyboardEvent): void {
  const selectedItem = this.stockForm.get('product')?.value;
  if (!selectedItem) return;
  
  // Get input element and its value
  const inputElement = event.target as HTMLInputElement;
  const currentValue = inputElement.value;
  const maxQuantity = selectedItem.quantity || 0;
  
  // Allow navigation keys and deletion
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowedKeys.includes(event.key)) {
    return;
  }
  
  // Only allow digits
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }
  
  // Predict the new value if this key is added
  // Need to handle cursor position to insert the digit at the right spot
  const start = inputElement.selectionStart || 0;
  const end = inputElement.selectionEnd || 0;
  const newValue = currentValue.substring(0, start) + event.key + currentValue.substring(end);
  
  // Convert to number and check against max
  const numericNewValue = Number(newValue);
  
  // If the new value would exceed the maximum, prevent the key entry
  if (numericNewValue > maxQuantity) {
    event.preventDefault();
    
    // Set the value to max (in case it's not already there)
    setTimeout(() => {
      this.stockForm.get('quantityRequested')?.setValue(maxQuantity);
    });
  }
}
}