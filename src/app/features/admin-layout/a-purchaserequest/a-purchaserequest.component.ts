import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface PurchaseRequest {
  pr_id: number;
  department: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  showActions?: boolean; // To manage the visibility of the actions
}

@Component({
  selector: 'app-a-purchaserequest',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './a-purchaserequest.component.html',
  styleUrls: ['./a-purchaserequest.component.css']
})
export class APurchaserequestComponent implements OnInit {
  purchaseRequests: PurchaseRequest[] = [];
  displayedRequests: PurchaseRequest[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5; // Number of items per page
  totalPages: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.totalPages = Math.ceil(this.purchaseRequests.length / this.itemsPerPage);
    this.updateDisplayedRequests();
  }

  initializeDummyData(): void {
    this.purchaseRequests = [
      { pr_id: 1, department: 'Marketing', item_description: 'Laptop', quantity: 2, unit_price: 1500, total_amount: 3000, status: 'Approved' },
      { pr_id: 2, department: 'Finance', item_description: 'Office Chair', quantity: 5, unit_price: 200, total_amount: 1000, status: 'Pending' },
      { pr_id: 3, department: 'IT', item_description: 'Monitor', quantity: 3, unit_price: 300, total_amount: 900, status: 'Rejected' },
      { pr_id: 4, department: 'HR', item_description: 'Projector', quantity: 1, unit_price: 800, total_amount: 800, status: 'Pending' },
      { pr_id: 5, department: 'Sales', item_description: 'Keyboard', quantity: 10, unit_price: 50, total_amount: 500, status: 'Approved' },
      { pr_id: 6, department: 'Support', item_description: 'Headphones', quantity: 4, unit_price: 100, total_amount: 400, status: 'Pending' },
      { pr_id: 7, department: 'Marketing', item_description: 'Camera', quantity: 2, unit_price: 600, total_amount: 1200, status: 'Approved' },
      { pr_id: 8, department: 'Finance', item_description: 'Desk', quantity: 3, unit_price: 300, total_amount: 900, status: 'Rejected' },
      { pr_id: 9, department: 'IT', item_description: 'Server', quantity: 1, unit_price: 2000, total_amount: 2000, status: 'Pending' },
      { pr_id: 10, department: 'HR', item_description: 'Software License', quantity: 5, unit_price: 150, total_amount: 750, status: 'Approved' },
    ];
  }

  updateDisplayedRequests(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedRequests = this.purchaseRequests.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedRequests();
  }

  toggleActions(request: PurchaseRequest): void {
    request.showActions = !request.showActions; // Toggle the visibility
  }

  approvePurchase(request: PurchaseRequest): void {
    const index = this.purchaseRequests.findIndex(r => r.pr_id === request.pr_id);
    if (index !== -1) {
      this.purchaseRequests[index].status = 'Approved';
      this.updateDisplayedRequests();
    }
  }

  rejectPurchase(request: PurchaseRequest): void {
    const index = this.purchaseRequests.findIndex(r => r.pr_id === request.pr_id);
    if (index !== -1) {
      this.purchaseRequests[index].status = 'Rejected';
      this.updateDisplayedRequests();
    }
  }

  deletePurchase(request: PurchaseRequest): void {
    this.purchaseRequests = this.purchaseRequests.filter(r => r.pr_id !== request.pr_id);
    this.totalPages = Math.ceil(this.purchaseRequests.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayedRequests();
  }

  createRequest(): void {
    this.router.navigate(['/admin/create-purchase-request']); // Adjust the path as necessary
  }

  detailsPurchase(request: PurchaseRequest): void {
    // Navigate to the details page for the selected purchase request
    this.router.navigate(['/admin/purchase-request-details', request.pr_id]); // Adjust the path as necessary
}

}
