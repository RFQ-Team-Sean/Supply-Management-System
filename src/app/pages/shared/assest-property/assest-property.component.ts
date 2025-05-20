import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextarea } from 'primeng/inputtextarea';
import { CrudService } from '../../../services/crud.service';
import { Category, Asset, Department, Location, PropertyType } from '../../../schema/schema';
import { categories, assets, departments, locations, propertyTypes } from '../../../schema/inventory-dummydata';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-assest-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TabViewModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    InputTextarea,
    ToolbarModule,
    CalendarModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './assest-property.component.html',
  styleUrls: ['./assest-property.component.scss']
})
export class AssestPropertyComponent implements OnInit {
  // Assets
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  selectedAsset: Asset | null = null;
  newAsset: Asset = {
    id: '',
    name: '',
    category: new Category(),
    serialNumber: '',
    status: 'Active',
    model: '',
    purchaseDate: new Date(),
    purchaseCost: 0,
    vendor: '',
    invoice: '',
    warrantyExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    department: null,
    location: null,
    propertyType: null,
    barcode: '',
    qrCode: '',
    image: '',
    notes: '',
    ownershipDetails: '',
    repairHistory: [],
    depreciation: 0
  };
  
  // Categories
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  selectedCategory: Category | null = null;
  newCategory: Category = new Category();
  
  // Departments and Locations
  departments: Department[] = [];
  locations: Location[] = [];
  propertyTypes: PropertyType[] = [];
  selectedDepartment: Department | null = null;
  selectedLocation: Location | null = null;
  
  // Status options
  statusOptions = [
    { name: 'Active', value: 'Active' },
    { name: 'Inactive', value: 'Inactive' },
    { name: 'Maintenance', value: 'Maintenance' },
    { name: 'Disposed', value: 'Disposed' }
  ];
  
  // Dialog visibility
  addAssetDialog: boolean = false;
  editAssetDialog: boolean = false;
  viewAssetDialog: boolean = false;
  addCategoryDialog: boolean = false;
  editCategoryDialog: boolean = false;
  addPropertyDialog: boolean = false;
  viewPropertyDialog: boolean = false;
  addMaintenanceDialog: boolean = false;
  viewMaintenanceDialog: boolean = false;
  addFinancialDialog: boolean = false;
  viewFinancialDialog: boolean = false;
  addComplianceDialog: boolean = false;
  viewComplianceDialog: boolean = false;
  
  // Other properties
  selectedProperty: any = null;
  selectedMaintenance: any = null;
  selectedFinancial: any = null;
  selectedCompliance: any = null;
  activeTabIndex: number = 0;
  assetSearchText: string = '';
  categorySearchText: string = '';

  constructor(
    private crudService: CrudService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadAssets();
    await this.loadDepartments();
    await this.loadLocations();
    await this.loadPropertyTypes();
  }

  // Tab change handler
  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }

  // Load data methods
  async loadCategories() {
    try {
      // Check if categories exist in localStorage
      const storedCategories = localStorage.getItem('Category');
      if (storedCategories) {
        this.categories = JSON.parse(storedCategories);
      } else {
        // Initialize with default categories if none exist
        this.categories = categories;
        localStorage.setItem('Category', JSON.stringify(this.categories));
      }
      this.filteredCategories = [...this.categories];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
      this.filteredCategories = [];
    }
  }

  async loadAssets() {
    try {
      // Check if assets exist in localStorage
      const storedAssets = localStorage.getItem('Asset');
      if (storedAssets) {
        this.assets = JSON.parse(storedAssets);
      } else {
        // Initialize with default assets if none exist
        this.assets = assets;
        localStorage.setItem('Asset', JSON.stringify(this.assets));
      }
      this.filteredAssets = [...this.assets];
    } catch (error) {
      console.error('Error loading assets:', error);
      this.assets = [];
      this.filteredAssets = [];
    }
  }

  async loadDepartments() {
    try {
      // Check if departments exist in localStorage
      const storedDepartments = localStorage.getItem('Department');
      if (storedDepartments) {
        this.departments = JSON.parse(storedDepartments);
      } else {
        // Initialize with default departments if none exist
        this.departments = departments;
        localStorage.setItem('Department', JSON.stringify(this.departments));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      this.departments = [];
    }
  }

  async loadLocations() {
    try {
      // Check if locations exist in localStorage
      const storedLocations = localStorage.getItem('Location');
      if (storedLocations) {
        this.locations = JSON.parse(storedLocations);
      } else {
        // Initialize with default locations if none exist
        this.locations = locations;
        localStorage.setItem('Location', JSON.stringify(this.locations));
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      this.locations = [];
    }
  }

  async loadPropertyTypes() {
    try {
      // Check if property types exist in localStorage
      const storedPropertyTypes = localStorage.getItem('PropertyType');
      if (storedPropertyTypes) {
        this.propertyTypes = JSON.parse(storedPropertyTypes);
      } else {
        // Initialize with default property types if none exist
        this.propertyTypes = propertyTypes;
        localStorage.setItem('PropertyType', JSON.stringify(this.propertyTypes));
      }
    } catch (error) {
      console.error('Error loading property types:', error);
      this.propertyTypes = [];
    }
  }

  // Category methods
  openNewCategory() {
    this.newCategory = new Category();
    this.addCategoryDialog = true;
  }

  async saveCategory() {
    if (this.newCategory.name) {
      try {
        // Format the category data
        const categoryData = { ...this.newCategory } as Partial<Category>;
        
        // Remove the id as it will be generated by the create method
        if ('id' in categoryData) {
          delete categoryData.id;
        }
        
        // Create the category using CrudService
        await this.crudService.create<Category>(Category, categoryData as Omit<Category, 'id'>);
        
        // Refresh the categories list
        await this.loadCategories();
        
        // Hide the dialog
        this.hideAddCategoryDialog();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category created successfully'
        });
      } catch (error) {
        console.error('Error saving category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create category'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
    }
  }

  editCategory(category: Category) {
    this.selectedCategory = { ...category };
    this.editCategoryDialog = true;
  }

  async updateCategory() {
    if (this.selectedCategory && this.selectedCategory.name) {
      try {
        // Get current categories from localStorage
        const storedCategories = localStorage.getItem('Category');
        if (!storedCategories) {
          throw new Error('No categories found in storage');
        }
        
        let categories = JSON.parse(storedCategories);
        
        // Find the category index
        const categoryIndex = categories.findIndex((cat: Category) => cat.id === this.selectedCategory?.id);
        
        if (categoryIndex === -1) {
          throw new Error('Category not found');
        }
        
        // Update the category
        categories[categoryIndex] = { ...this.selectedCategory };
        
        // Save back to localStorage
        localStorage.setItem('Category', JSON.stringify(categories));
        
        // Refresh the categories list
        await this.loadCategories();
        
        // Hide the dialog
        this.hideEditCategoryDialog();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category updated successfully'
        });
      } catch (error) {
        console.error('Error updating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'Failed to update category'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this category?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Get current categories from localStorage
          const storedCategories = localStorage.getItem('Category');
          if (!storedCategories) {
            throw new Error('No categories found in storage');
          }
          
          let categories = JSON.parse(storedCategories);
          
          // Find the category index
          const categoryIndex = categories.findIndex((cat: Category) => cat.id === category.id);
          
          if (categoryIndex === -1) {
            throw new Error('Category not found');
          }
          
          // Remove the category
          categories.splice(categoryIndex, 1);
          
          // Save back to localStorage
          localStorage.setItem('Category', JSON.stringify(categories));
          
          // Refresh the categories list
          await this.loadCategories();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category deleted successfully'
          });
        } catch (error) {
          console.error('Error deleting category:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to delete category'
          });
        }
      }
    });
  }

  searchCategories() {
    if (this.categorySearchText) {
      const searchText = this.categorySearchText.toLowerCase();
      this.filteredCategories = this.categories.filter(category => 
        category.name.toLowerCase().includes(searchText) || 
        (category.code && category.code.toLowerCase().includes(searchText)) ||
        (category.description && category.description.toLowerCase().includes(searchText))
      );
    } else {
      this.filteredCategories = [...this.categories];
    }
  }

  // Asset methods
  openNewAsset() {
    this.newAsset = {
      id: '',
      name: '',
      category: new Category(),
      serialNumber: '',
      status: 'Active',
      model: '',
      purchaseDate: new Date(),
      purchaseCost: 0,
      vendor: '',
      invoice: '',
      warrantyExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      department: null,
      location: null,
      propertyType: null,
      barcode: this.generateBarcode(),
      qrCode: this.generateQRCode(),
      image: '',
      notes: '',
      ownershipDetails: '',
      repairHistory: [],
      depreciation: 0
    };
    this.addAssetDialog = true;
  }

  async saveAsset() {
    if (this.isAssetFormValid()) {
      try {
        console.log('Saving asset:', this.newAsset);
        
        // Create a copy of the asset to avoid reference issues
        const assetToSave = { ...this.newAsset };
        
        // Generate ID if not present
        if (!assetToSave.id) {
          assetToSave.id = Date.now().toString();
        }
        
        // Generate barcode and QR code if not present
        if (!assetToSave.barcode) {
          assetToSave.barcode = this.generateBarcode();
        }
        
        if (!assetToSave.qrCode) {
          assetToSave.qrCode = this.generateQRCode();
        }
        
        // Save to localStorage
        const storedAssets = localStorage.getItem('Asset');
        let assets = storedAssets ? JSON.parse(storedAssets) : [];
        assets.push(assetToSave);
        localStorage.setItem('Asset', JSON.stringify(assets));
        
        // Refresh the assets list
        await this.loadAssets();
        this.filterAssets();
        
        // Hide the dialog
        this.hideAddAssetDialog();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset created successfully'
        });
      } catch (error) {
        console.error('Error saving asset:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create asset'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields'
      });
    }
  }

  viewAsset(asset: Asset) {
    this.selectedAsset = { ...asset };
    this.viewAssetDialog = true;
  }

  editAsset(asset: Asset) {
    this.selectedAsset = { ...asset };
    this.editAssetDialog = true;
  }

  async updateAsset() {
    if (this.isAssetFormValid()) {
      try {
        console.log('Updating asset:', this.selectedAsset);
        
        // Get current assets from localStorage
        const storedAssets = localStorage.getItem('Asset');
        if (!storedAssets) {
          throw new Error('No assets found in storage');
        }
        
        let assets = JSON.parse(storedAssets);
        
        // Find the asset index
        const assetIndex = assets.findIndex((asset: Asset) => asset.id === this.selectedAsset?.id);
        
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }
        
        // Update the asset
        assets[assetIndex] = { ...this.selectedAsset };
        
        // Save back to localStorage
        localStorage.setItem('Asset', JSON.stringify(assets));
        
        // Refresh the assets list
        await this.loadAssets();
        this.filterAssets();
        
        // Hide the dialog
        this.hideEditAssetDialog();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset updated successfully'
        });
      } catch (error) {
        console.error('Error updating asset:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update asset'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields'
      });
    }
  }

  deleteAsset(asset: Asset) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the asset "${asset.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          console.log('Deleting asset:', asset);
          
          // Get current assets from localStorage
          const storedAssets = localStorage.getItem('Asset');
          if (!storedAssets) {
            throw new Error('No assets found in storage');
          }
          
          let assets = JSON.parse(storedAssets);
          
          // Find the asset index
          const assetIndex = assets.findIndex((a: any) => a.id === asset.id);
          
          if (assetIndex === -1) {
            throw new Error('Asset not found');
          }
          
          // Remove the asset
          assets.splice(assetIndex, 1);
          
          // Save back to localStorage
          localStorage.setItem('Asset', JSON.stringify(assets));
          
          // Refresh the assets list
          await this.loadAssets();
          this.filterAssets();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset deleted successfully'
          });
        } catch (error) {
          console.error('Error deleting asset:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to delete asset'
          });
        }
      }
    });
  }

  disposeAsset(assetId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to dispose this asset?',
      header: 'Confirm Disposal',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Find the asset
          const asset = this.assets.find(a => a.id === assetId);
          if (!asset) {
            throw new Error('Asset not found');
          }
          
          // Update the asset status
          asset.status = 'Disposed';
          
          // Update the asset using CrudService
          await this.crudService.update<Asset>(Asset, assetId, asset);
          
          // Refresh the assets list
          await this.loadAssets();
          this.filterAssets();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset has been disposed'
          });
        } catch (error) {
          console.error('Error disposing asset:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to dispose asset'
          });
        }
      }
    });
  }

  searchAssets() {
    if (this.assetSearchText) {
      const searchText = this.assetSearchText.toLowerCase();
      this.filteredAssets = this.assets.filter(asset => 
        asset.name.toLowerCase().includes(searchText) || 
        asset.serialNumber.toLowerCase().includes(searchText) ||
        (asset.model && asset.model.toLowerCase().includes(searchText)) ||
        (asset.notes && asset.notes.toLowerCase().includes(searchText))
      );
    } else {
      this.filterAssets();
    }
  }

  filterAssets() {
    this.filteredAssets = this.assets.filter(asset => {
      let match = true;
      
      if (this.selectedCategory && asset.category) {
        match = match && asset.category.id === this.selectedCategory.id;
      }
      
      if (this.selectedDepartment && asset.department) {
        match = match && asset.department.id === this.selectedDepartment.id;
      }
      
      if (this.selectedLocation && asset.location) {
        match = match && asset.location.id === this.selectedLocation.id;
      }
      
      return match;
    });
  }

  // Dialog handlers
  hideAddAssetDialog() {
    this.addAssetDialog = false;
  }

  hideEditAssetDialog() {
    this.editAssetDialog = false;
  }

  hideViewAssetDialog() {
    this.viewAssetDialog = false;
  }

  hideAddCategoryDialog() {
    this.addCategoryDialog = false;
  }

  hideEditCategoryDialog() {
    this.editCategoryDialog = false;
  }

  // Utility methods
  isAssetFormValid(): boolean {
    // When adding a new asset
    if (this.addAssetDialog) {
      return !!(
        this.newAsset &&
        this.newAsset.name &&
        this.newAsset.category && this.newAsset.category.id &&
        this.newAsset.serialNumber &&
        this.newAsset.status &&
        this.newAsset.purchaseDate &&
        this.newAsset.purchaseCost > 0
      );
    }
    
    // When editing an existing asset
    if (this.editAssetDialog) {
      return !!(
        this.selectedAsset &&
        this.selectedAsset.name &&
        this.selectedAsset.category && this.selectedAsset.category.id &&
        this.selectedAsset.serialNumber &&
        this.selectedAsset.status &&
        this.selectedAsset.purchaseDate &&
        this.selectedAsset.purchaseCost > 0
      );
    }
    
    return false;
  }

  generateBarcode(): string {
    return 'ASSET-' + Math.floor(1000 + Math.random() * 9000);
  }

  generateQRCode(): string {
    return 'QR-ASSET-' + Math.floor(1000 + Math.random() * 9000);
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.selectedAsset) {
          this.selectedAsset.image = e.target.result;
        } else if (this.newAsset) {
          this.newAsset.image = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    if (this.selectedAsset) {
      this.selectedAsset.image = '';
    } else if (this.newAsset) {
      this.newAsset.image = '';
    }
  }
}

