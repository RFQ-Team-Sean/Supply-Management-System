import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseRequestService } from '../../../../core/services/purchase-request.service';
import { PurchaseRequestData } from '../../../../core/services/purchase-request.service';

interface RequestItem {
  item: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: string;
  totalCost: number;
}

@Component({
  selector: 'app-u-createprm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './u-createprm.component.html',
  styleUrl: './u-createprm.component.css'
})
export class UCreateprmComponent implements OnInit {
  prmForm: FormGroup;
  currentDateTime: Date = new Date();
  errorMessage: string = '';
  isLoading: boolean = true;
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private purchaseRequestService: PurchaseRequestService
  ) {
    this.prmForm = this.fb.group({
      departmentName: [{value: '', disabled: true}],
      requestedBy: [{value: '', disabled: true}],
      position: ['', Validators.required],
      contact: ['', Validators.required],
      email: [{value: '', disabled: true}],
      items: this.fb.array([this.createItem()]),
      totalAmount: [{value: 0, disabled: true}],
      justification: ['', Validators.required],
      accountCode: ['', Validators.required],
      amountAllocated: ['', [Validators.required, Validators.min(0)]],
      requestingOfficer: [{value: '', disabled: true}],
      departmentHead: [{value: '', disabled: true}]
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Get user's details with retry logic
      let retryCount = 0;
      let userDetails = null;
      
      while (retryCount < 2 && !userDetails) {
        try {
          userDetails = await this.purchaseRequestService.getUserDepartment();
        } catch (error: any) {
          if (error.message.includes('Session expired') || error.message.includes('JWT')) {
            retryCount++;
            if (retryCount >= 2) {
              this.router.navigate(['/login']);
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }

      if (!userDetails) {
        throw new Error('Failed to retrieve user details');
      }

      // Update form with user details including email
      this.prmForm.patchValue({
        departmentName: userDetails.name || 'Name Not Set',
        requestedBy: userDetails.departmentType || 'Department Not Set',
        email: userDetails.email || ''
      });

      // Generate unique PR ID for initial item
      try {
        const prId = await this.purchaseRequestService.generatePRId();
        this.itemsFormArray.at(0).patchValue({ prId });
      } catch (error: any) {
        console.error('Error generating initial PR ID:', error);
        this.errorMessage = 'Error generating PR ID. Please try again.';
      }

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Detailed error initializing form:', {
        error: error.name,
        message: error.message,
        stack: error.stack
      });
      this.errorMessage = 'Error loading form data. Please try again later.';
    } finally {
      this.isLoading = false;
    }

    // Subscribe to value changes to update total amount
    this.itemsFormArray.valueChanges.subscribe(() => {
      this.updateTotalAmount();
    });
  }

  get itemsFormArray() {
    return this.prmForm.get('items') as FormArray;
  }

  createItem() {
    return this.fb.group({
      prId: [{value: '', disabled: true}],
      item: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      unitOfMeasure: ['', Validators.required],
      totalCost: [{value: 0, disabled: true}]
    });
  }

  async addItem() {
    try {
      // Generate a new unique PR ID for the new item
      const prId = await this.purchaseRequestService.generatePRId();
      const newItem = this.createItem();
      newItem.patchValue({ prId });
      this.itemsFormArray.push(newItem);
    } catch (error) {
      console.error('Error generating PR ID for new item:', error);
      this.errorMessage = 'Error adding new item. Please try again.';
    }
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
    this.updateTotalAmount();
  }

  updateItemTotal(index: number) {
    const item = this.itemsFormArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const totalCost = quantity * unitPrice;
    item.patchValue({ totalCost }, { emitEvent: false });
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    const total = this.itemsFormArray.controls.reduce((sum, item) => {
      return sum + (item.get('quantity')?.value || 0) * (item.get('unitPrice')?.value || 0);
    }, 0);
    this.prmForm.patchValue({ totalAmount: total });
  }

  private getFormData(): PurchaseRequestData {
    const formValue = this.prmForm.getRawValue();
    // Get the PR ID from the first item in the items array
    const prId = formValue.items[0]?.prId;
    
    return {
      prId,
      departmentName: formValue.departmentName,
      requestedBy: formValue.requestedBy,
      position: formValue.position,
      contact: formValue.contact,
      email: formValue.email,
      items: formValue.items.map((item: any) => ({
        prId: item.prId,
        item: item.item,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: item.unitPrice,
        totalCost: item.totalCost
      })),
      totalAmount: formValue.totalAmount,
      justification: formValue.justification,
      accountCode: formValue.accountCode,
      amountAllocated: formValue.amountAllocated,
      requestingOfficer: formValue.requestingOfficer,
      departmentHead: formValue.departmentHead
    };
  }

  async saveDraft() {
    if (this.prmForm.valid) {
      try {
        this.isLoading = true;
        await this.purchaseRequestService.saveDraft(this.getFormData());
        this.successMessage = 'Draft saved successfully!';
        setTimeout(() => {
          this.router.navigate(['/user/u-purchasemanagement']);
        }, 2000);
      } catch (error) {
        console.error('Error saving draft:', error);
        this.errorMessage = 'Failed to save draft. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.prmForm);
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  async onSubmit() {
    if (this.prmForm.valid) {
      try {
        this.isLoading = true;
        await this.purchaseRequestService.submitRequest(this.getFormData());
        this.successMessage = 'Request submitted successfully!';
        setTimeout(() => {
          this.router.navigate(['/user/u-purchasemanagement']);
        }, 2000);
      } catch (error) {
        console.error('Error submitting request:', error);
        this.errorMessage = 'Failed to submit request. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.prmForm);
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  onCancel() {
    this.router.navigate(['/user/u-purchasemanagement']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
