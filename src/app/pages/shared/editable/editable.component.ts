import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ✅ Define User Roles
type UserRole = 'SUPERADMIN' | 'ADMINISTRATOR' | 'USER';

// ✅ Define WFP Status
type WFPStatus = 'Draft' | 'Submitted' | 'Approved' | 'Returned for Modification' | 'Denied';

// ✅ Define Work Financial Plan Structure
interface WorkFinancialPlan {
  id: number;
  title: string;
  department: string;
  budgetAmount: number;
  submissionDate: string;
  status: WFPStatus;
  submittedBy: string;
  isEditing: boolean;
  original?: WorkFinancialPlan | null;
}

@Component({
  selector: 'app-editable',
  templateUrl: './editable.component.html',
  styleUrls: ['./editable.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class EditableComponent {
  // ✅ Set Current User Role (Change this for testing different roles)
  currentUserRole: UserRole = 'ADMINISTRATOR';

  // ✅ Mock Data for Work Financial Plans (WFP)
  workFinancialPlans: WorkFinancialPlan[] = [
    {
      id: 1,
      title: 'Infrastructure Development Q1',
      department: 'Public Works',
      budgetAmount: 15000000,
      submissionDate: '2024-02-10',
      status: 'Submitted',
      submittedBy: 'SUPERADMIN',
      isEditing: false,
      original: null
    },
    {
      id: 2,
      title: 'Office Supplies Budget 2024',
      department: 'Procurement',
      budgetAmount: 500000,
      submissionDate: '2024-02-15',
      status: 'Draft',
      submittedBy: 'USER',
      isEditing: false,
      original: null
    }
  ];

  // ✅ Add New WFP
  addNewWFP(): void {
    this.workFinancialPlans.push({
      id: this.workFinancialPlans.length + 1,
      title: '',
      department: '',
      budgetAmount: 0,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      submittedBy: this.currentUserRole,
      isEditing: true,
      original: null
    });
  }

  // ✅ Edit WFP
  editWFP(index: number): void {
    this.workFinancialPlans[index].isEditing = true;
    this.workFinancialPlans[index].original = JSON.parse(
      JSON.stringify(this.workFinancialPlans[index])
    );
  }

  // ✅ Save WFP
  saveWFP(index: number): void {
    this.workFinancialPlans[index].isEditing = false;
    this.workFinancialPlans[index].original = null;
  }

  // ✅ Cancel Editing WFP
  cancelEditWFP(index: number): void {
    if (this.workFinancialPlans[index].original) {
      this.workFinancialPlans[index] = JSON.parse(
        JSON.stringify(this.workFinancialPlans[index].original)
      );
    }
    this.workFinancialPlans[index].isEditing = false;
  }

  // ✅ Delete WFP
  deleteWFP(index: number): void {
    if (confirm('Are you sure you want to delete this Work Financial Plan?')) {
      this.workFinancialPlans.splice(index, 1);
    }
  }

  // ✅ Submit WFP for Approval
  submitWFP(index: number): void {
    if (this.workFinancialPlans[index].status === 'Draft') {
      this.workFinancialPlans[index].status = 'Submitted';
      alert('WFP has been submitted to the Budget and Allocation Department.');
    } else {
      alert('Only Draft WFPs can be submitted.');
    }
  }

  // ✅ Acknowledge WFP (Admin/Approver Role)
  acknowledgeWFP(index: number): void {
    if (this.workFinancialPlans[index].status === 'Submitted') {
      this.workFinancialPlans[index].status = 'Approved';
      alert('WFP has been approved.');
    } else {
      alert('Only Submitted WFPs can be acknowledged.');
    }
  }

  // ✅ Return WFP for Modification
  returnWFP(index: number): void {
    if (this.workFinancialPlans[index].status === 'Submitted') {
      this.workFinancialPlans[index].status = 'Returned for Modification';
      alert('WFP has been returned for modification.');
    }
  }

  // ✅ Deny WFP
  denyWFP(index: number): void {
    if (this.workFinancialPlans[index].status === 'Submitted') {
      this.workFinancialPlans[index].status = 'Denied';
      alert('WFP has been denied.');
    }
  }
}
