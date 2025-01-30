import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseRequestService, ApprovedPurchaseRequest } from '../../../../core/services/purchase-request.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-d-prmapprovedrequest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-prmapprovedrequest.component.html',
  styleUrl: './d-prmapprovedrequest.component.css'
})
export class DPrmapprovedrequestComponent implements OnInit, OnDestroy {
  prmData: ApprovedPurchaseRequest[] = [];
  displayedPRMs: ApprovedPurchaseRequest[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  searchTerm: string = '';
  currentOpenActionId: number | null = null;
  private subscription: Subscription | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private purchaseRequestService: PurchaseRequestService
  ) {}

  ngOnInit(): void {
    this.loadApprovedRequests();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadApprovedRequests(): void {
    this.isLoading = true;
    this.error = null;
    
    this.subscription = this.purchaseRequestService.getApprovedRequests().subscribe({
      next: (data) => {
        console.log('Received approved requests:', data);
        this.prmData = data;
        this.updateDisplayedPRMs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching approved requests:', error);
        this.error = 'Failed to load approved requests. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  searchLogs(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue.toLowerCase();
    this.currentPage = 1;
    this.updateDisplayedPRMs();
  }

  toggleActions(prm: ApprovedPurchaseRequest): void {
    if (this.currentOpenActionId === prm.id) {
      this.currentOpenActionId = null;
    } else {
      this.currentOpenActionId = prm.id;
    }
  }

  trackPrm(prm: ApprovedPurchaseRequest): void {
    this.router.navigate(['/user/u-prmtrack', prm.pr_id]);
    this.currentOpenActionId = null;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPRMs();
  }

  private updateDisplayedPRMs(): void {
    console.log('Updating displayed PRMs with data:', this.prmData);
    const filteredData = this.prmData.filter(prm => 
      prm.department?.toLowerCase().includes(this.searchTerm) ||
      prm.requestor?.toLowerCase().includes(this.searchTerm) ||
      prm.pr_id.toString().includes(this.searchTerm)
    );
    
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(start, start + this.itemsPerPage);
    console.log('Displayed PRMs:', this.displayedPRMs);
  }

  get hasData(): boolean {
    return this.prmData.length > 0;
  }
}
