import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CrudService } from 'src/app/services/crud.service';
import { FundSource, Budget, Office, UserBudget } from 'src/app/schema/schema';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-funding-source',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    TabViewModule,
    DropdownModule,
    ToastModule,
    CardModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './funding-source.component.html',
})
export class FundingSourceComponent implements OnInit {
  @ViewChild('dt1') fundSourceTable!: Table;
  @ViewChild('dt2') budgetTable!: Table;

  fundSources: (FundSource & { total_budget?: number })[] = [];
  budgets: Budget[] = [];
  allBudgets: Budget[] = []; // Store unfiltered budgets for year filtering
  offices: Office[] = []; // Use Office type from schema
  fundSourceForm!: FormGroup;
  budgetForm!: FormGroup;
  fundSourceDialog = false;
  budgetDialog = false;
  submitted = false;
  loading = false;
  isEditMode = false;
  currentFundSourceId: string | null = null;
  currentBudgetId: string | null = null;
  years: number[] = [];
  selectedYear: number | null = null;

  deleteDialogVisible = false;
  deleteItemId: string | null = null;
  deleteItemType: 'fundSource' | 'budget' | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService
  ) {}

  async ngOnInit(): Promise<void> {
    this.initializeForms();
    this.initializeYears();

    await this.loadAll();
  }

  initializeForms(): void {
    this.fundSourceForm = this.formBuilder.group({
      source_name: ['', Validators.required],
    });

    this.budgetForm = this.formBuilder.group({
      budget_name: ['', Validators.required],
      office_id: ['', Validators.required], 
      fiscal_year: ['', Validators.required],
      budget_type: ['',Validators.required],
      allocated_budget: ['', Validators.required],
      fund_id: ['', Validators.required],
    });
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years
    this.selectedYear = currentYear; // Default to current year
  }

 async loadAll(): Promise<void> {
    this.loading = true;
    try {
      this.allBudgets = (await this.crudService.getAll(Budget)) || [];
      const userBudgets = (await this.crudService.getAll(UserBudget));
      this.budgets = [...this.allBudgets];
      this.budgets.forEach(b=>{
        b.used_amount = userBudgets.filter(ub=>ub.budget_id == b.id).reduce((acc,ub)=> acc+ub.allocated_amount , 0)
      })
      const fundSources = (await this.crudService.getAll(FundSource)) || [];
      this.offices = (await this.crudService.getAll(Office)) || []; // Load offices here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 2-second delay
      this.fundSources = fundSources.map((fs) => {
        const totalBudget = this.allBudgets
          .filter((b) => b.fund_id === fs.id)
          .reduce((sum, b) => sum + (b.allocated_budget || 0), 0);
        return { ...fs, total_budget: totalBudget };
      });
      this.applyYearFilter();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
    } finally {
      this.loading = false;
    }
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.applyYearFilter();
  }

  applyYearFilter(): void {
    if (this.budgetTable && this.selectedYear) {
      this.budgets = this.allBudgets.filter(b => b.fiscal_year === this.selectedYear);
      this.budgetTable.filter(this.selectedYear.toString(), 'fiscal_year', 'equals');
    } else {
      this.budgets = [...this.allBudgets]; // Reset to all budgets if no year selected
    }
  }

  // Fund Source Methods
  openNewFundSourceDialog(): void {
    this.fundSourceForm.reset({ source_name: '' });
    this.isEditMode = false;
    this.currentFundSourceId = null;
    this.submitted = false;
    this.fundSourceDialog = true;
  }

  async saveFundSource(): Promise<void> {
    this.submitted = true;
    if (this.fundSourceForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields' });
      return;
    }

    const formValue = this.fundSourceForm.value;
    const fundSourceData: FundSource = {
      id: this.isEditMode && this.currentFundSourceId ? this.currentFundSourceId : `${Date.now()}`,
      source_name: formValue.source_name,
    };

    this.loading = true;
    try {
      if (this.isEditMode && this.currentFundSourceId) {
        await this.crudService.update(FundSource, this.currentFundSourceId, fundSourceData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Fund Source updated successfully' });
      } else {
        await this.crudService.create(FundSource, fundSourceData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Fund Source added successfully' });
      }
      this.hideDialog();
      await this.loadAll();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save fund source' });
    } finally {
      this.loading = false;
    }
  }

  editFundSource(fundSource: FundSource & { total_budget?: number }): void {
    this.currentFundSourceId = fundSource.id;
    this.fundSourceForm.patchValue({ source_name: fundSource.source_name });
    this.isEditMode = true;
    this.fundSourceDialog = true;
  }

  hideDialog(): void {
    this.fundSourceDialog = false;
    this.submitted = false;
    this.currentFundSourceId = null;
  }

  // Budget Methods
  openNewBudgetDialog(): void {
    this.budgetForm.reset({
      budget_name: '',
      office_id: '', 
      fiscal_year: this.selectedYear || new Date().getFullYear(),
      allocated_budget: 0,
      fund_id: '',
    });
    this.isEditMode = false;
    this.currentBudgetId = null;
    this.submitted = false;
    this.budgetDialog = true;
  }

  async saveBudget(): Promise<void> {
    this.submitted = true;
    if (this.budgetForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields' });
      return;
    }

    const formValue = this.budgetForm.value;
    const budgetData: Budget = {
      id: this.isEditMode && this.currentBudgetId ? this.currentBudgetId : `${Date.now()}`,
      office_id: formValue.office_id,
      fund_id: formValue.fund_id,
      created_by: 'admin', // Replace with authenticated user
      fiscal_year: formValue.fiscal_year,
      budget_type: formValue.budget_type,
      budget_name: formValue.budget_name,
      allocated_budget: parseFloat(formValue.allocated_budget),
      used_amount: 0,
      date_created: new Date(),
    };

    this.loading = true;
    try {
      if (this.isEditMode && this.currentBudgetId) {
        await this.crudService.update(Budget, this.currentBudgetId, budgetData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Budget updated successfully' });
      } else {
        await this.crudService.create(Budget, budgetData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Budget added successfully' });
      }
      this.hideBudgetDialog();
      await this.loadAll();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save budget' });
    } finally {
      this.loading = false;
    }
  }

  editBudget(budget: Budget): void {
    this.currentBudgetId = budget.id;
    this.budgetForm.patchValue({
      budget_name: budget.budget_name,
      office_id: budget.office_id, 
      fiscal_year: budget.fiscal_year,
      allocated_budget: budget.allocated_budget,
      fund_id: budget.fund_id,
    });
    this.isEditMode = true;
    this.budgetDialog = true;
  }

  hideBudgetDialog(): void {
    this.budgetDialog = false;
    this.submitted = false;
    this.currentBudgetId = null;
  }

  // Delete Methods
  openDeleteDialog(type: 'fundSource' | 'budget', id: string): void {
    this.deleteDialogVisible = true;
    this.deleteItemType = type;
    this.deleteItemId = id;
  }

  async confirmDeleteAction(): Promise<void> {
    if (this.deleteItemType && this.deleteItemId) {
      this.loading = true;
      try {
        if (this.deleteItemType === 'fundSource') {
          await this.crudService.delete(FundSource, this.deleteItemId);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Fund Source deleted successfully' });
        } else if (this.deleteItemType === 'budget') {
          await this.crudService.delete(Budget, this.deleteItemId);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Budget deleted successfully' });
        }
        await this.loadAll();
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to delete ${this.deleteItemType}` });
      } finally {
        this.loading = false;
        this.deleteDialogVisible = false;
        this.deleteItemType = null;
        this.deleteItemId = null;
      }
    }
  }
}