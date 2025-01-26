import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PPMPQuarterDistribution {
  quantity: number;
  amount: number;
}

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
  quarterDistribution: {
    q1: PPMPQuarterDistribution;
    q2: PPMPQuarterDistribution;
    q3: PPMPQuarterDistribution;
    q4: PPMPQuarterDistribution;
  };
}

interface PPMPCategory {
  name: string;
  items: PPMPItem[];
}

interface PPMPFormData {
  fiscalYear: string;
  department: string;
  projectName: string;
  estimatedBudget: number;
  remainingBudget: number;
  categories: PPMPCategory[];
}

@Component({
  selector: 'app-d-createppmp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-createppmp.component.html',
  styleUrl: './d-createppmp.component.css'
})
export class DCreateppmpComponent {
adjustWidth($event: Event) {
throw new Error('Method not implemented.');
}
  formData: PPMPFormData = {
    fiscalYear: '',
    department: '',
    projectName: '',
    estimatedBudget: 0,
    remainingBudget: 0,
    categories: [],
  };
category: any;

  constructor(private router: Router) {}

  addCategory(): void {
    const newCategory: PPMPCategory = {
      name: '',
      items: []
    };
    this.formData.categories.push(newCategory);
  }

  removeCategory(categoryIndex: number): void {
    if (categoryIndex > -1 && categoryIndex < this.formData.categories.length) {
      this.formData.categories.splice(categoryIndex, 1);
    } else {
      console.error('Invalid category index:', categoryIndex);
    }
  }

  addItem(categoryIndex: number): void {
    const newItem: PPMPItem = {
      itemName: '',
      itemDescription: '',
      quantity: 0,
      unitOfMeasurement: '',
      estimatedUnitCost: 0,
      totalCost: 0,
      procurementMode: '',
      schedule: '',
      purpose: '',
      quarterDistribution: {
        q1: { quantity: 0, amount: 0 },
        q2: { quantity: 0, amount: 0 },
        q3: { quantity: 0, amount: 0 },
        q4: { quantity: 0, amount: 0 }
      }
    };
    this.formData.categories[categoryIndex].items.push(newItem);
  }

  removeItem(categoryIndex: number, itemIndex: number): void {
    const category = this.formData.categories[categoryIndex];
    if (itemIndex > -1 && itemIndex < category.items.length) {
      category.items.splice(itemIndex, 1);
    } else {
      console.error('Invalid item index:', itemIndex);
    }
  }

  calculateTotalCost(item: PPMPItem): void {
    // Calculate total item cost
    if (item.quantity && item.estimatedUnitCost) {
      item.totalCost = item.quantity * item.estimatedUnitCost;
    } else {
      item.totalCost = 0;
    }

    // Calculate quarter distribution totals
    const quarterTotal = 
      (item.quarterDistribution.q1.quantity || 0) +
      (item.quarterDistribution.q2.quantity || 0) +
      (item.quarterDistribution.q3.quantity || 0) +
      (item.quarterDistribution.q4.quantity || 0);

    // Validate quarter distribution matches total item quantity
    if (quarterTotal !== item.quantity) {
      console.warn('Quarter distribution quantities do not match total item quantity');
    }

    // Calculate quarter amounts with type assertion
    ['q1', 'q2', 'q3', 'q4'].forEach(quarter => {
      const quarterDist = item.quarterDistribution[quarter as keyof typeof item.quarterDistribution];
      quarterDist.amount = (quarterDist.quantity || 0) * item.estimatedUnitCost;
    });
  }

  onSubmit(): void {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
      // Add submission logic here
    } else {
      console.error('Form validation failed');
    }
  }

  onSaveAsDraft(): void {
    console.log('Saved as draft:', this.formData);
    // Add logic for saving as draft here
  }

  onCancel(): void {
    this.router.navigate(['/user/u-ppmpmanagement']);
  }

  private validateForm(): boolean {
    // Existing validation logic with added checks for quarter distribution
    if (!this.formData.fiscalYear || !this.formData.department || !this.formData.projectName) {
      console.error('Required fields are missing');
      return false;
    }

    if (this.formData.estimatedBudget < 0 || this.formData.remainingBudget < 0) {
      console.error('Budget values cannot be negative');
      return false;
    }

    for (const category of this.formData.categories) {
      if (!category.name) {
        console.error('Category name is missing:', category);
        return false;
      }
      for (const item of category.items) {
        if (!item.itemName || !item.quantity || !item.estimatedUnitCost) {
          console.error('Item validation failed:', item);
          return false;
        }

        // Additional validation for quarter distribution
        const quarterTotal = 
          item.quarterDistribution.q1.quantity +
          item.quarterDistribution.q2.quantity +
          item.quarterDistribution.q3.quantity +
          item.quarterDistribution.q4.quantity;

        if (quarterTotal !== item.quantity) {
          console.error('Quarter distribution quantities do not match total item quantity');
          return false;
        }
      }
    }

    return true;
  }
}