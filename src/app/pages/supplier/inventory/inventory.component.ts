import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../../services/crud.service';
import { SupplierItems, SupplierDetails } from '../../../schema/schema';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../../../services/user.service';
import { Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    InputTextarea,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    FileUploadModule,
    TagModule,
    ToolbarModule,
    DividerModule,
    MatCardModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  items: SupplierItems[] = [];
  supplierDetails: SupplierDetails | null = null;
  selectedItem: SupplierItems | null = null;
  
  itemDialog: boolean = false;
  deleteItemDialog: boolean = false;
  
  supplierCategories: { name: string, value: string }[] = [
    { name: 'Office Supplies', value: 'Office Supplies' },
    { name: 'Electronics', value: 'Electronics' },
    { name: 'Furniture', value: 'Furniture' },
    { name: 'Equipment', value: 'Equipment' },
    { name: 'Others', value: 'Others' }
  ];
  
  supplierUnits: { name: string, value: string }[] = [
    { name: 'Piece', value: 'piece' },
    { name: 'Box', value: 'box' },
    { name: 'Pack', value: 'pack' },
    { name: 'Set', value: 'set' },
    { name: 'Unit', value: 'unit' }
  ];

  newItem: SupplierItems = this.initializeNewItem();

  loading: boolean = false;

  searchValue: string = '';
  showDetailsModal: boolean = false;

  // Storage key for localStorage
  private readonly STORAGE_KEY = 'supplier_inventory_items';

  // Add new properties for image handling
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  defaultImage: string = 'https://placehold.co/200x200?text=No+Image';

  // Add these properties
  editDialog: boolean = false;  // For edit dialog visibility
  editingItem: SupplierItems = this.initializeNewItem();  // Initialize with default values instead of null

  constructor(
    private crudService: CrudService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    // Try to load from localStorage first
    this.loadFromLocalStorage();
    
    // Then load from server
    await this.loadItems();
    await this.loadSupplierDetails();
  }

  // Load items from localStorage
  loadFromLocalStorage() {
    try {
      const storedItems = localStorage.getItem(this.STORAGE_KEY);
      if (storedItems) {
        // Ensure every item has an id
        this.items = JSON.parse(storedItems).map((item: any) => ({
          ...item,
          id: item.id || crypto.randomUUID()
        }));
        this.saveToLocalStorage(); // Save back with IDs
        console.log('Items loaded from localStorage:', this.items.length);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Save items to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      console.log('Items saved to localStorage:', this.items.length);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  initializeNewItem(): SupplierItems {
    return {
      id: crypto.randomUUID(),
      product: '',
      barcode: '',
      warehouse: '',
      category: '',
      quantity: 0,
      dateAdded: new Date(),
      description: '',
      minimumQty: 0,
      unit: '',
      status: 'Available',
      imageUrl: this.defaultImage
    };
  }

  async loadItems() {
    try {
      const currentUser = this.userService.getUser();
      if (!currentUser?.id) throw new Error('User not authenticated');

      // Get items from server
      const serverItems = await this.crudService.getAll(SupplierItems, {
        filter: { warehouse: currentUser.id }
      });

      // Use only backend items (with real IDs)
      this.items = serverItems.map(item => ({
        ...item,
        dateAdded: new Date(item.dateAdded)
      }));
      this.saveToLocalStorage();

    } catch (error) {
      console.error('Error loading items:', error);
      this.loadFromLocalStorage();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Loading items from local storage'
      });
    }
  }

  async loadSupplierDetails() {
    try {
      const currentUser = this.userService.getUser();
      const userId = currentUser?.id;
      
      if (!userId) return;
      
      const suppliersData = await this.crudService.getAll(SupplierDetails, {
        filter: { User_id: userId }
      });
      
      if (suppliersData && suppliersData.length > 0) {
        this.supplierDetails = suppliersData[0];
      }
    } catch (error) {
      console.error('Error loading supplier details:', error);
    }
  }

  openNew() {
    this.newItem = this.initializeNewItem();
    this.itemDialog = true;
  }

  editItem(item: SupplierItems) {
    if (!item.id) {
      console.error('Cannot edit item without ID:', item);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot edit item: Missing ID'
      });
      return;
    }

    console.log('=== STARTING EDIT ===');
    console.log('Original Item:', {
      id: item.id,
      product: item.product,
      category: item.category,
      quantity: item.quantity,
      warehouse: item.warehouse
    });
    
    // Create a deep copy of the item to prevent reference issues
    this.editingItem = {
      ...JSON.parse(JSON.stringify(item)),
      dateAdded: new Date(item.dateAdded).toISOString()
    };
    
    console.log('Copied to editingItem:', {
      id: this.editingItem.id,
      product: this.editingItem.product,
      category: this.editingItem.category,
      quantity: this.editingItem.quantity,
      warehouse: this.editingItem.warehouse
    });
    
    this.editDialog = true;
  }

  deleteItem(item: SupplierItems) {
    this.deleteItemDialog = true;
    this.selectedItem = item;
  }

  async confirmDelete() {
    if (!this.selectedItem) return;
    
    try {
      await this.crudService.delete(SupplierItems, this.selectedItem.id);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item deleted successfully' });
      this.items = this.items.filter(item => item.id !== this.selectedItem?.id);
      
      // Save updated items to localStorage after deletion
      this.saveToLocalStorage();
      
      this.deleteItemDialog = false;
      this.selectedItem = null;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item' });
      console.error(error);
    }
  }

  hideDialog() {
    this.itemDialog = false;
  }

  // Add method to handle image selection
  onImageSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedImage = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.newItem.imageUrl = e.target.result; // Update item's image URL
      };
      reader.readAsDataURL(file);
    }
  }

  // Add method to remove selected image
  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.newItem.imageUrl = this.defaultImage;
  }

  // Modify saveItem method
  async saveItem() {
    if (this.validateItem()) {
      try {
        const currentUser = this.userService.getUser();
        if (!currentUser?.id) throw new Error('User not authenticated');

        // Generate ID only if it's a new item
        if (!this.newItem.id) {
          this.newItem.id = crypto.randomUUID();
        }

        const itemToSave = {
          ...this.newItem,
          warehouse: currentUser.id,
          dateAdded: new Date(),
        };

        // Use update if item exists, create if new
        if (this.editDialog) {
          await this.crudService.update(SupplierItems, this.newItem.id, itemToSave);
          const index = this.items.findIndex(item => item.id === this.newItem.id);
          if (index > -1) {
            this.items[index] = { ...itemToSave };
          }
        } else {
          const savedItem = await this.crudService.create(SupplierItems, itemToSave);
          this.items.push(savedItem);
        }

        this.items = [...this.items];
        this.itemDialog = false;
        this.newItem = this.initializeNewItem();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Item ${this.editDialog ? 'updated' : 'created'} successfully`
        });

        this.saveToLocalStorage();
      } catch (error) {
        console.error('Error saving item:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save item: ' + (error as Error).message
        });
      }
    }
  }
  
  validateItem(): boolean {
    return !!(
      this.newItem.product && 
      this.newItem.category && 
      this.newItem.unit && 
      this.newItem.quantity > 0
    );
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  exportCSV() {
    if (this.dt) {
      this.dt.exportCSV();
      this.messageService.add({
        severity: 'success', 
        summary: 'Exported', 
        detail: 'Data has been exported to CSV file'
      });
    }
  }

  viewItemDetails(item: SupplierItems) {
    this.selectedItem = item;
    this.showDetailsModal = true;
  }

  async updateItem() {
    if (this.editingItem && this.validateEditItem()) {
      try {
        const currentUser = this.userService.getUser();
        if (!currentUser?.id) throw new Error('User not authenticated');

        // Remove id from payload
        const { id, ...updatePayload } = this.editingItem;

        // Update in database using backend ID
        const updatedItem = await this.crudService.partial_update(
          SupplierItems,
          this.editingItem.id,
          { ...updatePayload, warehouse: currentUser.id }
        );

        // Reload from backend after update
        await this.loadItems();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Item updated successfully'
        });

        this.editDialog = false;
        this.editingItem = this.initializeNewItem();

      } catch (error) {
        console.error('Error updating item:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update item: ' + (error as Error).message
        });
      }
    }
  }

  validateEditItem(): boolean {
    return !!(
        this.editingItem?.product && 
        this.editingItem?.category && 
        this.editingItem?.unit && 
        this.editingItem?.quantity > 0
    );
  }

  hideEditDialog() {
    this.editDialog = false;
    this.editingItem = this.initializeNewItem();
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onEditImageSelect(event: any): void {
    const file = event.files[0];
    if (file && this.editingItem) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.editingItem!.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }
  }

  removeEditImage(): void {
    if (this.editingItem) {
        this.editingItem.imageUrl = this.defaultImage;
    }
  }

  // Add this helper method to sync with server
  private async syncWithServer() {
    try {
        const currentUser = this.userService.getUser();
        if (!currentUser?.id) return;

        // Get fresh data from server
        const serverItems = await this.crudService.getAll(SupplierItems, {
            filter: { warehouse: currentUser.id }
        });

        // Update local storage with server data
        this.items = serverItems;
        this.saveToLocalStorage();

    } catch (error) {
        console.error('Error syncing with server:', error);
    }
  }
}
