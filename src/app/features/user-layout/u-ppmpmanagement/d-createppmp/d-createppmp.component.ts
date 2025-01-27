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
    categories: [
    ],
  };
category: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService) {}

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

  async onSubmit() {
    try {
      // Prepare `ppmp_management` data
      const projectData = {
        project_name: this.formData.projectName,
        total_budget: this.formData.estimatedBudget,
        department: this.formData.department,
        estimated_department_budget: this.formData.estimatedBudget,
        remaining_department_budget: this.formData.remainingBudget,
        status: 'Pending', // Example initial status
        category: this.formData.categories.map((cat) => cat.name),
      };
  
      // Insert project into `ppmp_management`
      const result = await this.supabaseService.insertProject(projectData);
  
      if (!result || result.length === 0) {
        throw new Error('Failed to insert project into the database.');
      }
  
      const project = result[0]; // Safely access the first project
  
      // Prepare `ppmp_item_requests` data
      const itemsData = this.formData.categories.flatMap((category) =>
        category.items.map((item) => ({
          item_name: item.itemName,
          item_description: item.itemDescription,
          quantity: item.quantity,
          unit_of_measurement: item.unitOfMeasurement,
          est_unit_cost: item.estimatedUnitCost,
          total_cost: item.totalCost,
          sched_start_date: new Date(), // Example placeholder
          sched_end_date: new Date(),   // Example placeholder
          purpose: item.purpose,
          project_id: project.project_id, // Use inserted project's ID
          procurement_mode: item.procurementMode,
          category: category.name,
        }))
      );
  
      // Insert items into `ppmp_item_requests`
      await this.supabaseService.insertItems(itemsData);
  
      alert('Project and items submitted successfully!');
      this.router.navigate(['/user/u-ppmpmanagement']);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Check console for details.');
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