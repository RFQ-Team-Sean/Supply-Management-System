import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DPrmfilterComponent } from './d-prmfilter/d-prmfilter.component';
import { DPrmapprovedrequestComponent } from "./d-prmapprovedrequest/d-prmapprovedrequest.component";
import { DPrmrejectrequestComponent } from "./d-prmrejectrequest/d-prmrejectrequest.component";

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
  prmData: PRM[] = [
    { 
      pr_id: 1, 
      requested_item: 'Laptop', 
      total_amount: 45000, 
      date_submitted: '2024-03-01', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'John Doe', 
      priority: 'High' 
    },
    { 
      pr_id: 2, 
      requested_item: 'Office Chairs', 
      total_amount: 15000, 
      date_submitted: '2024-03-02', 
      status: 'Pending', 
      department: 'Admin', 
      requestor: 'Jane Smith', 
      priority: 'Medium' 
    },
    { 
      pr_id: 3, 
      requested_item: 'Printer', 
      total_amount: 25000, 
      date_submitted: '2024-03-02', 
      status: 'Pending', 
      department: 'HR', 
      requestor: 'Mike Johnson', 
      priority: 'High' 
    },
    { 
      pr_id: 4, 
      requested_item: 'Software Licenses', 
      total_amount: 35000, 
      date_submitted: '2024-03-03', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'Sarah Wilson', 
      priority: 'High' 
    },
    { 
      pr_id: 5, 
      requested_item: 'Filing Cabinets', 
      total_amount: 8000, 
      date_submitted: '2024-03-03', 
      status: 'Pending', 
      department: 'Admin', 
      requestor: 'Robert Brown', 
      priority: 'Low' 
    },
    { 
      pr_id: 6, 
      requested_item: 'Projector', 
      total_amount: 30000, 
      date_submitted: '2024-03-04', 
      status: 'Pending', 
      department: 'Training', 
      requestor: 'Emily Davis', 
      priority: 'Medium' 
    },
    { 
      pr_id: 7, 
      requested_item: 'Office Supplies', 
      total_amount: 5000, 
      date_submitted: '2024-03-04', 
      status: 'Pending', 
      department: 'HR', 
      requestor: 'Tom Anderson', 
      priority: 'Low' 
    },
    { 
      pr_id: 8, 
      requested_item: 'Network Equipment', 
      total_amount: 50000, 
      date_submitted: '2024-03-05', 
      status: 'Pending', 
      department: 'IT', 
      requestor: 'Lisa Chen', 
      priority: 'High' 
    },
    { 
      pr_id: 9, 
      requested_item: 'Air Conditioner', 
      total_amount: 40000, 
      date_submitted: '2024-03-05', 
      status: 'Pending', 
      department: 'Facilities', 
      requestor: 'David Miller', 
      priority: 'Medium' 
    },
    { 
      pr_id: 10, 
      requested_item: 'Training Materials', 
      total_amount: 12000, 
      date_submitted: '2024-03-06', 
      status: 'Pending', 
      department: 'Training', 
      requestor: 'Karen White', 
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

  performAction(action: string, prm: PRM): void {
    switch (action) {
      case 'View':
        this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
        break;
      case 'Print':
        this.printPRM(prm); // Call print method
        break;
      case 'Edit':
        this.router.navigate(['/user/u-prmpedit', prm.pr_id]); // Ensure routing to edit
        break;
      case 'Delete':
        this.prmData = this.prmData.filter(p => p.pr_id !== prm.pr_id);
        this.totalPages = Math.ceil(this.prmData.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.updateDisplayedPRMs();
        console.log(`Deleting PR ID: ${prm.pr_id}`);
        break;
      default:
        console.log(`No action defined for: ${action}`);
    }
    this.currentOpenActionId = null;
  }

  private printPRM(prm: PRM): void {
    console.log(`Printing PR ID: ${prm.pr_id}`);
    // Example implementation for printing
    const printContent = `
      <h1>Purchase Request Details</h1>
      <p>PR ID: ${prm.pr_id}</p>
      <p>Requested Item: ${prm.requested_item}</p>
      <p>Total Amount: ${prm.total_amount}</p>
      <p>Date Submitted: ${prm.date_submitted}</p>
      <p>Status: ${prm.status}</p>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private cancelPRM(prm: PRM): void {
    if (confirm(`Are you sure you want to cancel PR ID: ${prm.pr_id}?`)) {
      // Update the status to 'Canceled'
      const index = this.prmData.findIndex(p => p.pr_id === prm.pr_id);
      if (index !== -1) {
        this.prmData[index].status = 'Canceled'; // Update status or handle as needed
        this.updateDisplayedPRMs(); // Refresh displayed data
        console.log(`Canceled PR ID: ${prm.pr_id}`);
      }
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPRMs();
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

  createPRM() {
    this.router.navigate(['/user/u-createprm']);
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

  viewPrm(prm: PRM): void {
    this.router.navigate(['/user/u-prmviewdetails', prm.pr_id]);
  }

  editPrm(prm: PRM): void {
    this.router.navigate(['/user/u-prmpedit', prm.pr_id]);
  }

  submitPrm(prm: PRM): void {
    if (confirm(`Are you sure you want to submit PR ID: ${prm.pr_id}?`)) {
      const index = this.prmData.findIndex(p => p.pr_id === prm.pr_id);
      if (index !== -1) {
        this.prmData[index].status = 'Pending';
        this.updateDisplayedPRMs();
      }
    }
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
