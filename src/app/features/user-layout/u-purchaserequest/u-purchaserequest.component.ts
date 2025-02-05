import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DPrmfilterComponent } from './d-prmfilter/d-prmfilter.component';
import { DPrmapprovedrequestComponent } from "./d-prmapprovedrequest/d-prmapprovedrequest.component";
import { DPrmrejectrequestComponent } from "./d-prmrejectrequest/d-prmrejectrequest.component";
import { PurchaseRequestService, PurchaseRequest } from '../../../core/services/purchase-request.service';

@Component({
  selector: 'app-u-purchaserequest',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DPrmfilterComponent,
    DPrmapprovedrequestComponent,
    DPrmrejectrequestComponent
  ],
  templateUrl: './u-purchaserequest.component.html',
  styleUrls: ['./u-purchaserequest.component.css']
})
export class UPurchaserequestComponent implements OnInit {
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

  private loadPendingRequests(): void {
    this.isLoading = true;
    this.error = null;
    
    this.purchaseRequestService.getPendingRequests().subscribe({
      next: (data) => {
        console.log('Received data in component:', data);
        this.prmData = data;
        this.updateDisplayedPRMs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching pending requests:', error);
        this.error = 'Failed to load pending requests';
        this.isLoading = false;
      }
    });
  }

  filterPRMs(): void {
    this.updateDisplayedPRMs();
  }

  toggleActions(prm: PurchaseRequest): void {
    this.currentOpenActionId = this.currentOpenActionId === prm.pr_id ? null : prm.pr_id;
  }

  trackPrm(prm: PurchaseRequest): void {
    this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  performAction(action: string, prm: PurchaseRequest): void {
    switch (action) {
      case 'View':
        this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
        break;
      case 'Edit':
        this.router.navigate(['/user/u-prmpedit', prm.pr_id]);
        break;
      case 'Submit':
        this.submitPrm(prm);
        break;
      default:
        console.log(`No action defined for: ${action}`);
    }
    this.currentOpenActionId = null;
  }

  async submitPrm(prm: PurchaseRequest): Promise<void> {
    if (confirm(`Are you sure you want to submit PR ID: ${prm.pr_id}?`)) {
      try {
        this.isLoading = true;
        await this.purchaseRequestService.submitDeptRequest(prm.pr_id);
        console.log('Successfully submitted request:', prm.pr_id);
        
        // Reload the data after successful submission
        await this.loadPendingRequests();
        
        // Show success message (you can implement a proper notification system)
        alert('Purchase request submitted successfully!');
      } catch (error) {
        console.error('Error submitting request:', error);
        alert('Failed to submit purchase request. Please try again.');
      } finally {
        this.isLoading = false;
        this.currentOpenActionId = null;
      }
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPRMs();
  }

  switchView(view: string): void {
    this.currentView = view;
    if (view === 'pending') {
      this.loadPendingRequests();
    }
  }

  searchRoles(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue.toLowerCase();
    this.currentPage = 1;
    this.updateDisplayedPRMs();
  }

  viewPrm(prm: PurchaseRequest): void {
    this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
  }

  editPrm(prm: PurchaseRequest): void {
    this.router.navigate(['/user/u-prmedit', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  private updateDisplayedPRMs(): void {
    console.log('Updating displayed PRMs with data:', this.prmData);
    const filteredData = this.prmData.filter(prm => 
      prm.requested_item.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.department?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.requestor?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      prm.pr_id.toString().includes(this.searchTerm)
    );
    
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(start, start + this.itemsPerPage);
    console.log('Displayed PRMs:', this.displayedPRMs);
  }

  onFilterChange(filterData: any): void {
    // Implement filter logic here
    console.log('Filter data:', filterData);
  }
}

