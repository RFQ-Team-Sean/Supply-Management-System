import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseRequestService } from '../../../../core/services/purchase-request.service';

interface PRM {
  pr_tracking_id: string;
  date_created: string;
  department: string;
  date_approved: string;
  remarks: string;
}

@Component({
  selector: 'app-gsopurchaserequest-approvedrequest',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gsopurchaserequest-approvedrequest.component.html',
  styleUrl: './gsopurchaserequest-approvedrequest.component.css'
})
export class GsopurchaserequestApprovedrequestComponent implements OnInit {
  prmData: PRM[] = [];
  displayedPRMs: PRM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  searchTerm: string = '';
  currentOpenActionId: string | null = null;

  constructor(
    private purchaseRequestService: PurchaseRequestService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadApprovedRequests();
  }

  private loadApprovedRequests() {
    // Sample data - replace with actual service call
    this.prmData = [
      {
        pr_tracking_id: 'PR-001',
        department: 'Department 1',
        date_created: '2024-01-01',
        date_approved: '2024-01-05',
        remarks: 'Approved'
      },
      {
        pr_tracking_id: 'PR-002',
        department: 'Department 2',
        date_created: '2024-01-02',
        date_approved: '2024-01-06',
        remarks: 'Approved with modifications'
      },
      {
        pr_tracking_id: 'PR-003',
        department: 'Department 3',
        date_created: '2024-01-03',
        date_approved: '2024-01-07',
        remarks: 'Approved'
      },
      {
        pr_tracking_id: 'PR-004',
        department: 'Department 4',
        date_created: '2024-01-04',
        date_approved: '2024-01-08',
        remarks: 'Approved with conditions'
      },
      {
        pr_tracking_id: 'PR-005',
        department: 'Department 5',
        date_created: '2024-01-05',
        date_approved: '2024-01-09',
        remarks: 'Approved'
      },
      {
        pr_tracking_id: 'PR-006',
        department: 'Department 6',
        date_created: '2024-01-06',
        date_approved: '2024-01-10',
        remarks: 'Approved with notes'
      },
      {
        pr_tracking_id: 'PR-007',
        department: 'Department 7',
        date_created: '2024-01-07',
        date_approved: '2024-01-11',
        remarks: 'Approved'
      },
      {
        pr_tracking_id: 'PR-008',
        department: 'Department 8',
        date_created: '2024-01-08',
        date_approved: '2024-01-12',
        remarks: 'Approved with revisions'
      }
    ];
    this.updateDisplayedPRMs();
  }

  searchLogs(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.currentPage = 1;
    this.updateDisplayedPRMs();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPRMs();
    }
  }

  private updateDisplayedPRMs(): void {
    const filteredData = this.prmData.filter(prm => 
      prm.pr_tracking_id.toLowerCase().includes(this.searchTerm) ||
      prm.date_created.toLowerCase().includes(this.searchTerm) ||
      prm.date_approved.toLowerCase().includes(this.searchTerm) ||
      prm.remarks.toLowerCase().includes(this.searchTerm)
    );
    
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(start, start + this.itemsPerPage);
  }

  toggleActions(prm: PRM): void {
    this.currentOpenActionId = this.currentOpenActionId === prm.pr_tracking_id ? null : prm.pr_tracking_id;
  } 

  trackingPrm(prm: PRM): void {
    this.router.navigate(['/gso/gso-purchaserequest/approved-tracking', prm.pr_tracking_id]);
    this.currentOpenActionId = null;
  }
}