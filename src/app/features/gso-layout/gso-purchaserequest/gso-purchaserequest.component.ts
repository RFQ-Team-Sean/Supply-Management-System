import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GsoPrmfilterComponent } from '../gso-prmfilter/gso-prmfilter.component';
import { GsoPrmapprovedrequestComponent } from './gso-prmapprovedrequest/gso-prmapprovedrequest.component';
import { GsoPrmrejectrequestComponent } from './gso-prmrejectrequest/gso-prmrejectrequest.component';

interface PRM {
  pr_id: number;
  requested_item: string;
  total_amount: number;
  date_submitted: string;
  status: string;
  department?: string;
  requestor?: string;
  priority?: string;
}

interface FilterData {
  dateFrom: string;
  dateTo: string;
  costValue: number;
}

@Component({
  selector: 'app-gso-purchaserequest',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    GsoPrmfilterComponent,
    GsoPrmapprovedrequestComponent,
    GsoPrmrejectrequestComponent,
  ],
  templateUrl: './gso-purchaserequest.component.html',
  styleUrl: './gso-purchaserequest.component.css'
})
export class GsoPurchaserequestComponent implements OnInit {
  prmData: PRM[] = [
    { 
      pr_id: 1, 
      requested_item: 'Desktop Computer Set', 
      total_amount: 45000, 
      date_submitted: '2024-03-01', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'John Santos', 
      priority: 'High' 
    },
    { 
      pr_id: 2, 
      requested_item: 'Office Chairs', 
      total_amount: 15000, 
      date_submitted: '2024-03-02', 
      status: 'Pending', 
      department: 'Admin', 
      requestor: 'Maria Garcia', 
      priority: 'Medium' 
    },
    { 
      pr_id: 3, 
      requested_item: 'Printer with Scanner', 
      total_amount: 25000, 
      date_submitted: '2024-03-03', 
      status: 'Pending', 
      department: 'HR', 
      requestor: 'Pedro Cruz', 
      priority: 'High' 
    },
    { 
      pr_id: 4, 
      requested_item: 'Software Licenses', 
      total_amount: 35000, 
      date_submitted: '2024-03-04', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'Ana Reyes', 
      priority: 'High' 
    },
    { 
      pr_id: 5, 
      requested_item: 'Filing Cabinets', 
      total_amount: 8000, 
      date_submitted: '2024-03-05', 
      status: 'Pending', 
      department: 'Admin', 
      requestor: 'Jose Dela Cruz', 
      priority: 'Low' 
    },
    { 
      pr_id: 6, 
      requested_item: 'Conference Room Projector', 
      total_amount: 30000, 
      date_submitted: '2024-03-06', 
      status: 'Pending', 
      department: 'Training', 
      requestor: 'Michelle Torres', 
      priority: 'Medium' 
    },
    { 
      pr_id: 7, 
      requested_item: 'Office Supplies Bundle', 
      total_amount: 5000, 
      date_submitted: '2024-03-07', 
      status: 'Pending', 
      department: 'HR', 
      requestor: 'Ramon Gonzales', 
      priority: 'Low' 
    },
    { 
      pr_id: 8, 
      requested_item: 'Network Equipment', 
      total_amount: 50000, 
      date_submitted: '2024-03-08', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'Lisa Chen', 
      priority: 'High' 
    },
    { 
      pr_id: 9, 
      requested_item: 'Air Conditioning Unit', 
      total_amount: 40000, 
      date_submitted: '2024-03-09', 
      status: 'Pending', 
      department: 'Facilities', 
      requestor: 'David Miller', 
      priority: 'Medium' 
    },
    { 
      pr_id: 10, 
      requested_item: 'Training Materials Set', 
      total_amount: 12000, 
      date_submitted: '2024-03-10', 
      status: 'Pending', 
      department: 'Training', 
      requestor: 'Karen Santos', 
      priority: 'Low' 
    }
  ];

  displayedPRMs: PRM[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: string = 'pending';

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateDisplayedPRMs();
  }

  filterPRMs(): void {
    this.updateDisplayedPRMs();
  }

  toggleActions(prm: PRM): void {
    this.currentOpenActionId = this.currentOpenActionId === prm.pr_id ? null : prm.pr_id;
  }

  viewPrm(prm: PRM): void {
    this.router.navigate(['/gso/gso-prmviewdetails', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  approvePrm(prm: PRM): void {
    if (confirm(`Are you sure you want to approve PR ID: ${prm.pr_id}?`)) {
      const index = this.prmData.findIndex(p => p.pr_id === prm.pr_id);
      if (index !== -1) {
        this.prmData[index].status = 'Approved';
        this.updateDisplayedPRMs();
      }
    }
    this.currentOpenActionId = null;
  }

  rejectPrm(prm: PRM): void {
    if (confirm(`Are you sure you want to reject PR ID: ${prm.pr_id}?`)) {
      const index = this.prmData.findIndex(p => p.pr_id === prm.pr_id);
      if (index !== -1) {
        this.prmData[index].status = 'Rejected';
        this.updateDisplayedPRMs();
      }
    }
    this.currentOpenActionId = null;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPRMs();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      case 'Pending':
        return '#000054';
      default:
        return 'black';
    }
  }

  private updateDisplayedPRMs(): void {
    const pendingData = this.prmData.filter(prm => 
      prm.status === 'Pending' && 
      prm.requested_item.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    
    this.totalPages = Math.ceil(pendingData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = pendingData.slice(start, start + this.itemsPerPage);
  }

  switchView(view: string): void {
    this.currentView = view;
  }

  searchRoles(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue;
    this.filterPRMs();
  }

  onFilterChange(filterData: FilterData): void {
    const filteredData = this.prmData.filter(prm => {
      if (prm.status !== 'Pending') return false;
      
      const cost = prm.total_amount;
      const date = new Date(prm.date_submitted);
      
      const costMatch = cost <= filterData.costValue;
      let dateMatch = true;
      
      if (filterData.dateFrom && filterData.dateTo) {
        const fromDate = new Date(filterData.dateFrom);
        const toDate = new Date(filterData.dateTo);
        dateMatch = date >= fromDate && date <= toDate;
      }
      
      return costMatch && dateMatch;
    });
    
    this.displayedPRMs = filteredData;
  }
}