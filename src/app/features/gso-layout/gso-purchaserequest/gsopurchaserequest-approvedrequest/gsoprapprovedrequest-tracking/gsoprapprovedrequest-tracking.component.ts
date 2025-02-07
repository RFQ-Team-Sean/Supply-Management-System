import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PurchaseRequestService } from '../../../../../core/services/purchase-request.service';

interface TrackingData {
  dateCreated: string;
  trackingCode: string;
  department: string;
  requestedBy: string;
  position: string;
  approvedBy: string;
  approverPosition: string;
  remarks: string;
  items: {
    itemId: number;
    description: string;
    unit: string;
    unitCost: number;
    quantity: number;
    totalCost: number;
  }[];
  timeline: {
    date: string;
    time: string;
    status: string;
    isCompleted: boolean;
  }[];
  grandTotal: number;
}

@Component({
  selector: 'app-gsoprapprovedrequest-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gsoprapprovedrequest-tracking.component.html',
  styleUrl: './gsoprapprovedrequest-tracking.component.css'
})
export class GsoprapprovedrequestTrackingComponent implements OnInit {
  pr_id: string = '';
  trackingData: TrackingData = {
    dateCreated: '2024-01-12 10:24:59',
    trackingCode: 'PR-2024-123456789',
    department: 'Department of Information Technology',
    requestedBy: 'Michel Ara Jr',
    position: 'IT Specialist',
    approvedBy: 'Michel Ara Jr',
    approverPosition: 'Department Head',
    remarks: 'For Supplier',
    items: [
      { itemId: 1, description: 'Description 1', unit: 'Unit', unitCost: 10000, quantity: 2, totalCost: 20000 },
      { itemId: 2, description: 'Description 2', unit: 'Unit', unitCost: 10000, quantity: 10, totalCost: 100000 },
      { itemId: 3, description: 'Description 3', unit: 'Unit', unitCost: 10000, quantity: 100, totalCost: 500000 },
      { itemId: 4, description: 'Description 4', unit: 'Unit', unitCost: 10000, quantity: 20, totalCost: 120000 }
    ],
    timeline: [
      { date: 'Jan 03, 2024', time: '12:45:51 PM', status: 'PR APPROVED', isCompleted: true },
      { date: 'Jan 03, 2024', time: '12:45:51 PM', status: 'PR FORWARD TO GENERAL SERVICE OFFICE', isCompleted: false },
      { date: 'Jan 03, 2024', time: '12:45:51 PM', status: 'PURCHASE REQUEST CREATED AND PREPARING FOR APPROVAL', isCompleted: false }
    ],
    grandTotal: 2129500
  };
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private purchaseRequestService: PurchaseRequestService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.pr_id = params['pr_id'];
    });
  }

  printTracking(): void {
    let printContents = document.querySelector('.printable')?.innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents || '';
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reattach event listeners after restoring content
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}
