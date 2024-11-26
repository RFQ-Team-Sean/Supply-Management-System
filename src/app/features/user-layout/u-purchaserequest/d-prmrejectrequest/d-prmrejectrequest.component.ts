import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PRM {
  id: number;
  pr_id: string;
  requested_item: string;
  total_amount: number;
  date_submitted: string;
  status: string;
  department?: string;
  requestor?: string;
  priority?: string;
  rejection_reason?: string;
}

@Component({
  selector: 'app-d-prmrejectrequest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-prmrejectrequest.component.html',
  styleUrl: './d-prmrejectrequest.component.css'
})
export class DPrmrejectrequestComponent implements OnInit {
  prmData: PRM[] = [
    { 
      id: 1,
      pr_id: 'PR-2024-011', 
      requested_item: 'Gaming Laptops', 
      total_amount: 250000, 
      date_submitted: '2024-03-01', 
      status: 'Rejected', 
      department: 'IT', 
      requestor: 'Alex Thompson', 
      priority: 'Low',
      rejection_reason: 'Budget constraints and non-essential items'
    },
    { 
      id: 2,
      pr_id: 'PR-2024-012', 
      requested_item: 'Luxury Office Chairs', 
      total_amount: 180000, 
      date_submitted: '2024-03-02', 
      status: 'Rejected', 
      department: 'Admin', 
      requestor: 'Emily Parker', 
      priority: 'Medium',
      rejection_reason: 'Excessive cost for standard office equipment'
    },
    { 
      id: 3,
      pr_id: 'PR-2024-013', 
      requested_item: 'VR Training Equipment', 
      total_amount: 300000, 
      date_submitted: '2024-03-03', 
      status: 'Rejected', 
      department: 'HR', 
      requestor: 'Chris Wilson', 
      priority: 'High',
      rejection_reason: 'Technology not aligned with current training methods'
    },
    { 
      id: 4,
      pr_id: 'PR-2024-014', 
      requested_item: 'Premium Coffee Machines', 
      total_amount: 120000, 
      date_submitted: '2024-03-04', 
      status: 'Rejected', 
      department: 'Facilities', 
      requestor: 'Sophie Martinez', 
      priority: 'Low',
      rejection_reason: 'Non-essential expense'
    },
    { 
      id: 5,
      pr_id: 'PR-2024-015', 
      requested_item: 'Art Installations', 
      total_amount: 200000, 
      date_submitted: '2024-03-05', 
      status: 'Rejected', 
      department: 'Admin', 
      requestor: 'Daniel Lee', 
      priority: 'Low',
      rejection_reason: 'Not within current office improvement plan'
    },
    { 
      id: 6,
      pr_id: 'PR-2024-016', 
      requested_item: 'Drone Equipment', 
      total_amount: 150000, 
      date_submitted: '2024-03-06', 
      status: 'Rejected', 
      department: 'Security', 
      requestor: 'Rachel Green', 
      priority: 'Medium',
      rejection_reason: 'Requires additional permits and certifications'
    },
    { 
      id: 7,
      pr_id: 'PR-2024-017', 
      requested_item: 'Smart Whiteboards', 
      total_amount: 280000, 
      date_submitted: '2024-03-07', 
      status: 'Rejected', 
      department: 'Training', 
      requestor: 'Mark Davis', 
      priority: 'High',
      rejection_reason: 'Current equipment still functional'
    },
    { 
      id: 8,
      pr_id: 'PR-2024-018', 
      requested_item: 'Electric Vehicles', 
      total_amount: 1500000, 
      date_submitted: '2024-03-08', 
      status: 'Rejected', 
      department: 'Operations', 
      requestor: 'Linda Wilson', 
      priority: 'Medium',
      rejection_reason: 'Beyond current fiscal year budget'
    },
    { 
      id: 9,
      pr_id: 'PR-2024-019', 
      requested_item: 'Advanced Security System', 
      total_amount: 450000, 
      date_submitted: '2024-03-09', 
      status: 'Rejected', 
      department: 'Security', 
      requestor: 'Tom Anderson', 
      priority: 'High',
      rejection_reason: 'Current system still under maintenance contract'
    },
    { 
      id: 10,
      pr_id: 'PR-2024-020', 
      requested_item: 'Server Equipment', 
      total_amount: 800000, 
      date_submitted: '2024-03-10', 
      status: 'Rejected', 
      department: 'IT', 
      requestor: 'Jessica Brown', 
      priority: 'High',
      rejection_reason: 'Alternative cloud solution preferred'
    }
  ];

  displayedPRMs: PRM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  searchTerm: string = '';
  currentOpenActionId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateDisplayedPRMs();
  }

  searchLogs(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue.toLowerCase();
    this.currentPage = 1;
    this.updateDisplayedPRMs();
  }

  toggleActions(prm: PRM): void {
    if (this.currentOpenActionId === prm.id) {
      this.currentOpenActionId = null;
    } else {
      this.currentOpenActionId = prm.id;
    }
  }

  viewPrm(prm: PRM): void {
    this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPRMs();
  }

  editPrm(prm: PRM): void {
    this.router.navigate(['/user/u-prmedit', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  private updateDisplayedPRMs(): void {
    const filteredData = this.prmData.filter(prm => 
      prm.department?.toLowerCase().includes(this.searchTerm) ||
      prm.requestor?.toLowerCase().includes(this.searchTerm) ||
      prm.pr_id.toLowerCase().includes(this.searchTerm)
    );
    
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(start, start + this.itemsPerPage);
  }
}
