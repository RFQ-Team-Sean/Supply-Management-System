import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MaterialModule } from 'src/app/material.module';
import { CrudService } from 'src/app/services/crud.service';
import { PaymentTerm } from 'src/app/schema/schema';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payment-terms',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputSwitchModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './payment-terms.component.html',
  providers: [MessageService, ConfirmationService]
})
export class PaymentTermsComponent implements OnInit {
  terms: PaymentTerm[] = [];
  termDialog = false;
  termForm!: FormGroup;
  submitted = false;
  loading = false;
  isEditMode = false;
  currentTermId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private crudService: CrudService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTerms();
  }

  initializeForm(): void {
    this.termForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', Validators.required],
      description: ['', Validators.required],
      days: [0, [Validators.required, Validators.min(0)]],
      percentageRequired: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  async loadTerms(): Promise<void> {
    this.loading = true;
    try {
      this.terms = await this.crudService.getAll(PaymentTerm);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payment terms' });
    } finally {
      this.loading = false;
    }
  }

  openNewTermDialog(): void {
    this.termForm.reset({ isActive: true, days: 0, percentageRequired: 100 });
    this.isEditMode = false;
    this.termDialog = true;
  }

  editTerm(term: PaymentTerm): void {
    this.termForm.patchValue(term);
    this.isEditMode = true;
    this.currentTermId = term.id;
    this.termDialog = true;
  }

  deleteTerm(term: PaymentTerm): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment term?',
      accept: async () => {
        this.loading = true;
        try {
          await this.crudService.delete(PaymentTerm, term.id!);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment term deleted successfully' });
          this.loadTerms();
        } catch {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment term' });
        } finally {
          this.loading = false;
        }
      }
    });
  }

  async saveTerm(): Promise<void> {
    this.submitted = true;
    if (this.termForm.invalid) return;
    
    const formValue = this.termForm.value;
    this.loading = true;
    
    try {
      if (this.isEditMode && this.currentTermId) {
        await this.crudService.update(PaymentTerm, this.currentTermId, formValue);
      } else {
        await this.crudService.create(PaymentTerm, formValue);
      }
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Payment term ${this.isEditMode ? 'updated' : 'created'} successfully` });
      this.loadTerms();
      this.hideDialog();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to ${this.isEditMode ? 'update' : 'create'} payment term` });
    } finally {
      this.loading = false;
    }
  }

  hideDialog(): void {
    this.termDialog = false;
    this.submitted = false;
    this.termForm.reset({ isActive: true, days: 0, percentageRequired: 100 });
  }
}
