import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface PPMP {
  account_id: number;
  department: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_amount?: number; // Calculated field for the total amount
}

@Component({
  selector: 'app-u-ppmpmanagement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './u-ppmpmanagement.component.html',
  styleUrls: ['./u-ppmpmanagement.component.css']
})
export class UPpmpmanagement implements OnInit {
  ppmpData: PPMP[] = [];
  displayedPPMPs: PPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
    this.updateDisplayedPPMPs();
  }

  initializeDummyData(): void {
    this.ppmpData = [
      { account_id: 1, department: 'Finance', item_description: 'Office Supplies', quantity: 10, unit_price: 25.00, total_amount: 250.00 },
      { account_id: 2, department: 'HR', item_description: 'Employee Benefits', quantity: 15, unit_price: 150.00, total_amount: 2250.00 },
      { account_id: 3, department: 'IT', item_description: 'Software Licenses', quantity: 5, unit_price: 200.00, total_amount: 1000.00 },
      { account_id: 4, department: 'Logistics', item_description: 'Fuel Costs', quantity: 30, unit_price: 3.50, total_amount: 105.00 },
      { account_id: 5, department: 'Procurement', item_description: 'Stationery', quantity: 50, unit_price: 1.25, total_amount: 62.50 },
      { account_id: 6, department: 'Admin', item_description: 'Cleaning Supplies', quantity: 40, unit_price: 0.80, total_amount: 32.00 },
      { account_id: 7, department: 'Sales', item_description: 'Promotional Material', quantity: 20, unit_price: 5.00, total_amount: 100.00 },
      { account_id: 8, department: 'Marketing', item_description: 'Event Sponsorship', quantity: 2, unit_price: 1000.00, total_amount: 2000.00 },
      { account_id: 9, department: 'Customer Service', item_description: 'Uniforms', quantity: 25, unit_price: 15.00, total_amount: 375.00 },
      { account_id: 10, department: 'Research', item_description: 'Lab Supplies', quantity: 12, unit_price: 50.00, total_amount: 600.00 }
    ];

    // Calculate Total Amount for each item
    this.ppmpData.forEach(ppmp => {
      ppmp.total_amount = parseFloat((ppmp.quantity * ppmp.unit_price).toFixed(2));
    });
  }

  updateDisplayedPPMPs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPPMPs = this.ppmpData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPPMPs();
  }

  toggleActions(ppmp: PPMP): void {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.account_id ? null : ppmp.account_id;
  }

  deletePPMP(ppmp: PPMP): void {
    this.ppmpData = this.ppmpData.filter(p => p.account_id !== ppmp.account_id);
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayedPPMPs();
  }

  editPPMP(ppmp: PPMP): void {
    this.router.navigate(['/admin/edit-ppmp', ppmp.account_id]);
  }

  createPPMP(): void {
    this.router.navigate(['/admin/create-ppmp']);
  }
}
