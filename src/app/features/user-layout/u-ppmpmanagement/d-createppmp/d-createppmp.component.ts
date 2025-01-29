import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';

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
  department: string;
  projectName: string;
  estimatedBudget: number;
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
  formData: PPMPFormData = {
    department: '',
    projectName: '',
    estimatedBudget: 0,
    categories: [],
  };
item: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

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

  calculateQuarterAmount(item: PPMPItem, quarter: 'q1' | 'q2' | 'q3' | 'q4'): void {
    const quarterDist = item.quarterDistribution[quarter];
    quarterDist.amount = (quarterDist.quantity || 0) * item.estimatedUnitCost;
    this.validateQuarterDistribution(item);
  }

  validateQuarterDistribution(item: PPMPItem): boolean {
    const totalQuarterQuantity = 
      (item.quarterDistribution.q1.quantity || 0) +
      (item.quarterDistribution.q2.quantity || 0) +
      (item.quarterDistribution.q3.quantity || 0) +
      (item.quarterDistribution.q4.quantity || 0);
    
    if (totalQuarterQuantity !== item.quantity) {
      console.warn('Quarter distribution quantities do not match total item quantity');
      return false;
    }
    return true;
  }

  calculateTotalCost(item: PPMPItem): void {
    if (item.quantity && item.estimatedUnitCost) {
      item.totalCost = item.quantity * item.estimatedUnitCost;
      
      // Update all quarter amounts
      ['q1', 'q2', 'q3', 'q4'].forEach(quarter => {
        this.calculateQuarterAmount(item, quarter as 'q1' | 'q2' | 'q3' | 'q4');
      });
    } else {
      item.totalCost = 0;
    }
  }

  async onSubmit(status: string) {
    try {
      //Validate form before submission
      if (!this.validateForm()) {
        alert('Please fill in all required fields and check quarter distributions.');
        return;
      }

      const projectData = {
        project_name: this.formData.projectName,
        total_budget: this.formData.estimatedBudget,
        department: this.formData.department,
        estimated_department_budget: this.formData.estimatedBudget,
        status: status,
        category: this.formData.categories.map((cat) => cat.name),
      };

      const result = await this.supabaseService.insertProject(projectData);

      if (!result || result.length === 0) {
        throw new Error('Failed to insert project into the database.');
      }

      const project = result[0];

      const itemsData = this.formData.categories.flatMap((category) =>
        category.items.map((item) => ({
          item_name: item.itemName,
          item_description: item.itemDescription,
          quantity: item.quantity,
          unit_of_measurement: item.unitOfMeasurement,
          est_unit_cost: item.estimatedUnitCost,
          total_cost: item.totalCost,
          project_id: project.project_id,
          category: category.name,
          qd_q1_qty: item.quarterDistribution.q1.quantity,
          qd_q1_amt: item.quarterDistribution.q1.amount,
          qd_q2_qty: item.quarterDistribution.q2.quantity,
          qd_q2_amt: item.quarterDistribution.q2.amount,
          qd_q3_qty: item.quarterDistribution.q3.quantity,
          qd_q3_amt: item.quarterDistribution.q3.amount,
          qd_q4_qty: item.quarterDistribution.q4.quantity,
          qd_q4_amt: item.quarterDistribution.q4.amount,
        }))
      );

      await this.supabaseService.insertItems(itemsData);
      
      if(status === 'Pending') {
        alert('PPMP submitted successfully!');
      } else if (status === 'Draft') {
        alert('PPMP saved as draft successfully!');
      }
      
      this.router.navigate(['/user/u-ppmpmanagement']);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Check console for details.');
    }
  }

  onSaveAsDraft(): void {
    this.onSubmit('Draft');
  }

  onCancel(): void {
    this.router.navigate(['/user/u-ppmpmanagement']);
  }

  private validateForm(): boolean {
    if (!this.formData.department || !this.formData.projectName) {
      console.error('Required fields are missing');
      return false;
    }

    if (this.formData.estimatedBudget < 0) {
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

        if (!this.validateQuarterDistribution(item)) {
          console.error('Quarter distribution validation failed for item:', item);
          return false;
        }
      }
    }

    return true;
  }
}