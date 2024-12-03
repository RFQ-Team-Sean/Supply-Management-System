import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PPMPItem {
  itemName: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasurement: string;
  estimatedUnitCost: number;
  totalCost: number;
  procurementMode: string;
  schedule: string;
  purpose: string;
}

interface PPMPFormData {
  fiscalYear: string;
  department: string;
  projectName: string;
  estimatedBudget: number;
  remainingBudget: number;
  items: PPMPItem[];
}

@Component({
  selector: 'app-d-createppmp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-createppmp.component.html',
  styleUrl: './d-createppmp.component.css'
})
export class DCreateppmpComponent {
  formData: PPMPFormData = {
    fiscalYear: '',
    department: '',
    projectName: '',
    estimatedBudget: 0,
    remainingBudget: 0,
    items: []
  };

  constructor(private router: Router) {}

  addItem() {
    const newItem: PPMPItem = {
      itemName: '',
      itemDescription: '',
      quantity: 0,
      unitOfMeasurement: '',
      estimatedUnitCost: 0,
      totalCost: 0,
      procurementMode: '',
      schedule: '',
      purpose: ''
    };
    this.formData.items.push(newItem);
  }

  removeItem(index: number) {
    this.formData.items.splice(index, 1);
  }

  calculateTotalCost(item: PPMPItem) {
    item.totalCost = item.quantity * item.estimatedUnitCost;
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
    // Add your submission logic here
  }

  onSaveAsDraft() {
    console.log('Saved as draft:', this.formData);
    // Add your draft saving logic here
  }

  onCancel() {
    this.router.navigate(['/user/u-ppmpmanagement']);
  }
}
