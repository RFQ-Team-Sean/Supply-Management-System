import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BudgetService } from 'src/app/services/budget.service';
import { DepartmentService } from 'src/app/services/departments.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface Budget {
  departmentId: string;
  departmentName?: string;
  fiscalYear: number;
  totalBudget: number;
  allocatedAmount: number;
  remainingBalance: number;
  procurementItems?: ProcurementItem[]; // Add procurement items to the budget
}

interface Department {
  id?: string;
  name: string;
}

interface ProcurementItem {
  itemDescription: string;
  quantity: number;
  estimatedCost: number;
  preferredSupplier: string;
  justification: string;
}

@Component({
  selector: 'app-ppmp-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './ppmp-list.component.html',
  styleUrls: ['./ppmp-list.component.scss'],
})
export class PpmpListComponent implements OnInit {
  budgets: Budget[] = [];
  loading: boolean = false;
  departments: Department[] = [];
  ppmpForm: FormGroup;
  dialogRef!: MatDialogRef<any>;

  @ViewChild('createPpmpDialog') createPpmpDialog!: TemplateRef<any>;
  @ViewChild('detailsDialog') detailsDialog!: TemplateRef<any>;

  selectedBudget: Budget | null = null; // Track the selected budget for details

  constructor(
    private budgetService: BudgetService,
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.ppmpForm = this.fb.group({
      department: ['', Validators.required],
      projectName: ['', Validators.required],
      fiscalYear: ['', Validators.required],
      totalBudget: ['', Validators.required],
      allocatedAmount: ['', Validators.required],
      procurementItems: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
    this.loadDepartments();
    this.addProcurementItem(); // Add an initial item
  }

  get procurementItems(): FormArray {
    return this.ppmpForm.get('procurementItems') as FormArray;
  }

  addProcurementItem(): void {
    const itemGroup = this.fb.group({
      itemDescription: ['', Validators.required],
      quantity: ['', Validators.required],
      estimatedCost: ['', Validators.required],
      preferredSupplier: [''],
      justification: ['', Validators.required],
    });
    this.procurementItems.push(itemGroup);
  }

  removeProcurementItem(index: number): void {
    this.procurementItems.removeAt(index);
  }

  loadBudgets(): void {
    this.loading = true;
    const storedBudgets = localStorage.getItem('budgets');
    if (storedBudgets) {
      this.budgets = JSON.parse(storedBudgets);
      this.loading = false;
    } else {
      this.budgetService.getAllBudgetAllocations().subscribe(
        // async (budgets: Budget[]) => {
        //   const departments = await this.departmentService.getAllDepartments();
        //   this.budgets = budgets.map((budget) => ({
        //     ...budget,
        //     departmentName:
        //       departments.find((dept) => dept.id === budget.departmentId)?.name || 'Unknown',
        //   }));
        //   this.loading = false;
        // },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load budget data',
          });
          this.loading = false;
        }
      );
    }
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().then((departments) => {
      this.departments = departments;
    });
  }

  openCreatePPMPDialog(): void {
    this.dialogRef = this.dialog.open(this.createPpmpDialog, {
      width: '800px',
    });
    this.ppmpForm.reset();
    this.procurementItems.clear();
    this.addProcurementItem(); // Reset with one item
  }

  onSubmit(): void {
    if (this.ppmpForm.valid) {
      const formValue = this.ppmpForm.value;

      // Create a new budget entry
      const newEntry: Budget = {
        departmentId: formValue.department,
        departmentName:
          this.departments.find((dept) => dept.id === formValue.department)?.name || 'Unknown',
        fiscalYear: formValue.fiscalYear,
        totalBudget: formValue.totalBudget,
        allocatedAmount: formValue.allocatedAmount,
        remainingBalance: formValue.totalBudget - formValue.allocatedAmount,
        procurementItems: formValue.procurementItems, // Include procurement items
      };

      // Add the new entry to the budgets array
      this.budgets = [...this.budgets, newEntry];

      // Save the updated budgets array to localStorage
      localStorage.setItem('budgets', JSON.stringify(this.budgets));

      // Close the dialog
      this.dialogRef.close();

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'New PPMP entry added successfully!',
      });
    }
  }

  // Open details dialog for a selected budget
  openDetailsDialog(budget: Budget): void {
    this.selectedBudget = budget;
    this.dialog.open(this.detailsDialog, {
      width: '800px',
    });
  }
}