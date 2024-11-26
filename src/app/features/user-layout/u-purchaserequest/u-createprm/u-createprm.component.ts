import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.prmForm = this.fb.group({
      departmentName: ['', Validators.required],
      requestedBy: ['', Validators.required],
      contact: ['', Validators.required],
      prId: ['PR-' + new Date().getTime(), Validators.required],
      dateSubmitted: [new Date().toISOString().split('T')[0], Validators.required],
      items: this.fb.array([this.createItem()]),
      totalAmount: [{value: 0, disabled: true}],
      justification: ['', Validators.required]
    });
  }

  ngOnInit(): void {
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
      item: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      unitOfMeasure: ['', Validators.required],
      totalCost: [{value: 0, disabled: true}]
    });
  }

  addItem() {
    this.itemsFormArray.push(this.createItem());
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

  onSubmit() {
    if (this.prmForm.valid) {
      console.log(this.prmForm.value);
      // Add your submission logic here
    } else {
      this.markFormGroupTouched(this.prmForm);
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
