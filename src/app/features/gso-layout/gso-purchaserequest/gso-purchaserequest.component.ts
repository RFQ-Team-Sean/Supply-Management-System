import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GsoPrmfilterComponent } from '../gso-prmfilter/gso-prmfilter.component';
import { GsoPrmapprovedrequestComponent } from './gso-prmapprovedrequest/gso-prmapprovedrequest.component';
import { GsoPrmrejectrequestComponent } from './gso-prmrejectrequest/gso-prmrejectrequest.component';
import { PurchaseRequestService, PurchaseRequest } from '../../../core/services/purchase-request.service';

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
  prmData: PurchaseRequest[] = [];
  displayedPRMs: PurchaseRequest[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: string = 'pending';
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private purchaseRequestService: PurchaseRequestService
  ) {}

  ngOnInit() {
    this.loadPendingRequests();
  }

  isPending(status: string): boolean {
    return status === 'Submitted';
  }

  private loadPendingRequests(): void {
    this.isLoading = true;
    this.error = null;

    this.purchaseRequestService.getGsoPendingRequests().subscribe({
      next: (data) => {
        console.log('Received GSO pending requests:', data);
        this.prmData = data;
        this.updateDisplayedPRMs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching GSO pending requests:', error);
        this.error = 'Failed to load pending requests';
        this.isLoading = false;
      }
    });
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
    const filteredData = this.prmData.filter(prm => 
      prm.requested_item.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.department?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.requestor?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.pr_id.toString().includes(this.searchTerm)
    );
    
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(start, start + this.itemsPerPage);
    console.log('Displayed GSO PRMs:', this.displayedPRMs);
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
      if (prm.status !== 'Submitted') return false;
      
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