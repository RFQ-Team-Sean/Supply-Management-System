import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PRM {
  id: number;
  pr_id: string;
  requested_item: string;
  total_amount: number;
  date_approved: string;
  status: string;
  department?: string;
  requestor?: string;
  priority?: string;
}

@Component({
  selector: 'app-d-prmapprovedrequest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-prmapprovedrequest.component.html',
  styleUrl: './d-prmapprovedrequest.component.css'
})
export class DPrmapprovedrequestComponent implements OnInit {
  prmData: PRM[] = [
    { 
      id: 1,
      pr_id: 'PR-2024-001', 
      requested_item: 'Desktop Computers', 
      total_amount: 150000, 
      date_approved: '2024-03-05', 
      status: 'Approved', 
      department: 'IT', 
      requestor: 'John Smith', 
      priority: 'High' 
    },
    { 
      id: 2,
      pr_id: 'PR-2024-002', 
      requested_item: 'Office Furniture', 
      total_amount: 75000, 
      date_approved: '2024-03-06', 
      status: 'Approved', 
      department: 'Admin', 
      requestor: 'Maria Garcia', 
      priority: 'Medium' 
    },
    { 
      id: 3,
      pr_id: 'PR-2024-003', 
      requested_item: 'Training Materials', 
      total_amount: 25000, 
      date_approved: '2024-03-07', 
      status: 'Approved', 
      department: 'HR', 
      requestor: 'David Lee', 
      priority: 'Low' 
    },
    { 
      id: 4,
      pr_id: 'PR-2024-004', 
      requested_item: 'Network Equipment', 
      total_amount: 200000, 
      date_approved: '2024-03-08', 
      status: 'Approved', 
      department: 'IT', 
      requestor: 'Sarah Johnson', 
      priority: 'High' 
    },
    { 
      id: 5,
      pr_id: 'PR-2024-005', 
      requested_item: 'Office Supplies', 
      total_amount: 15000, 
      date_approved: '2024-03-09', 
      status: 'Approved', 
      department: 'Admin', 
      requestor: 'Michael Brown', 
      priority: 'Medium' 
    },
    { 
      id: 6,
      pr_id: 'PR-2024-006', 
      requested_item: 'Software Licenses', 
      total_amount: 180000, 
      date_approved: '2024-03-10', 
      status: 'Approved', 
      department: 'IT', 
      requestor: 'Emma Wilson', 
      priority: 'High' 
    },
    { 
      id: 7,
      pr_id: 'PR-2024-007', 
      requested_item: 'Conference Equipment', 
      total_amount: 95000, 
      date_approved: '2024-03-11', 
      status: 'Approved', 
      department: 'Admin', 
      requestor: 'James Taylor', 
      priority: 'Medium' 
    },
    { 
      id: 8,
      pr_id: 'PR-2024-008', 
      requested_item: 'Training Room Furniture', 
      total_amount: 120000, 
      date_approved: '2024-03-12', 
      status: 'Approved', 
      department: 'HR', 
      requestor: 'Lisa Anderson', 
      priority: 'High' 
    },
    { 
      id: 9,
      pr_id: 'PR-2024-009', 
      requested_item: 'Security Cameras', 
      total_amount: 85000, 
      date_approved: '2024-03-13', 
      status: 'Approved', 
      department: 'Security', 
      requestor: 'Robert Martinez', 
      priority: 'High' 
    },
    { 
      id: 10,
      pr_id: 'PR-2024-010', 
      requested_item: 'Air Conditioning Units', 
      total_amount: 160000, 
      date_approved: '2024-03-14', 
      status: 'Approved', 
      department: 'Facilities', 
      requestor: 'Jennifer White', 
      priority: 'Medium' 
    }
  ];

  displayedPRMs: PRM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
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
