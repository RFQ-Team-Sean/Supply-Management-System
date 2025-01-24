import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BidmanagementBidinvitationComponent } from "./bidmanagement-bidinvitation/bidmanagement-bidinvitation.component";
import { BidmanagementBidcanvasComponent } from "./bidmanagement-bidcanvas/bidmanagement-bidcanvas.component";
import { BidmanagmentFilterComponent } from "./bidmanagment-filter/bidmanagment-filter.component";
import { BidmanagementReviewbidsComponent } from "./bidmanagement-reviewbids/bidmanagement-reviewbids.component";

interface BIDM {
  id: number;
  number: string;
  requested_items: string[];
  bidders: number;
  start: string;
  end: string;
  status: string;
  date_created: string;
}

@Component({
  selector: 'app-bac-bidmanagement',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    BidmanagementBidinvitationComponent,
    BidmanagementBidcanvasComponent,
    BidmanagmentFilterComponent,
    BidmanagementReviewbidsComponent,
  ],
  templateUrl: './bac-bidmanagement.component.html',
  styleUrl: './bac-bidmanagement.component.css'
})
export class BacBidmanagementComponent implements OnInit {
  bidmData: BIDM[] = [];
  displayedPpmp: BIDM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: 'active' | 'invitation' | 'canvas' = 'active';
  displayedBidm: BIDM[] = [];
  showReviewModal = false;
  selectedBid: BIDM | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.updateDisplayedBidm();
  }

  initializeDummyData(): void {
    this.bidmData = [
      {
        id: 1,
        number: '1',
        requested_items: ['Desktop Computers', 'Laptops'],
        bidders: 5,
        start: '2024-01-15',
        end: '2024-02-15',
        status: 'On-Going',
        date_created: '2024-01-01'
      },
      {
        id: 2,
        number: '2',
        requested_items: ['Office Furniture', 'Filing Cabinets'],
        bidders: 3,
        start: '2024-02-01',
        end: '2024-03-01',
        status: 'On-Going',
        date_created: '2024-01-15'
      },
      {
        id: 3,
        number: '3',
        requested_items: ['Laboratory Equipment', 'Chemical Supplies'],
        bidders: 4,
        start: '2024-02-15',
        end: '2024-03-15',
        status: 'On-Going',
        date_created: '2024-01-30'
      },
      {
        id: 4,
        number: '4',
        requested_items: ['Network Equipment', 'Server Hardware'],
        bidders: 6,
        start: '2024-03-01',
        end: '2024-04-01',
        status: 'On-Going',
        date_created: '2024-02-01'
      },
      {
        id: 5,
        number: '5',
        requested_items: ['Security Cameras', 'Access Control System'],
        bidders: 4,
        start: '2024-03-15',
        end: '2024-04-15',
        status: 'On-Going',
        date_created: '2024-02-15'
      },
      {
        id: 6,
        number: '6',
        requested_items: ['Audio-Visual Equipment', 'Projectors'],
        bidders: 3,
        start: '2024-04-01',
        end: '2024-05-01',
        status: 'On-Going',
        date_created: '2024-03-01'
      },
      {
        id: 7,
        number: '7',
        requested_items: ['Medical Supplies', 'First Aid Equipment'],
        bidders: 5,
        start: '2024-04-15',
        end: '2024-05-15',
        status: 'On-Going',
        date_created: '2024-03-15'
      },
      {
        id: 8,
        number: '8',
        requested_items: ['Sports Equipment', 'Gym Facilities'],
        bidders: 4,
        start: '2024-05-01',
        end: '2024-06-01',
        status: 'On-Going',
        date_created: '2024-04-01'
      }
    ];
    this.totalPages = Math.ceil(this.bidmData.length / this.itemsPerPage);
  }

  updateDisplayedPpmp(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmp = this.bidmData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedBidm();
  }

  toggleActions(bidm: BIDM): void {
    this.currentOpenActionId = this.currentOpenActionId === bidm.id ? null : bidm.id;
  }

  switchView(view: 'active' | 'invitation' | 'canvas'): void {
    this.currentView = view;
  }

  viewPpmp(ppmp: BIDM): void {
    this.router.navigate(['/user/u-ppmpviewdetails', ppmp.id]);
  }

  editPpmp(ppmp: BIDM): void {
    this.router.navigate(['/user/u-ppmpedit', ppmp.id]);
  }

  submitPpmp(ppmp: BIDM): void {
    ppmp.status = 'On-Going';
    this.updateDisplayedBidm();
    this.currentOpenActionId = null;
  }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedPpmp = this.bidmData.filter(bidm => 
      bidm.number.toLowerCase().includes(searchTerm) ||
      bidm.requested_items.some(item => item.toLowerCase().includes(searchTerm))
    );
    this.currentPage = 1;
    this.updateDisplayedPpmp();
  }

  applyPpmpFilters(filters: any): void {
    this.displayedBidm = this.bidmData.filter(bidm => {
      // Filter by date range
      const bidmDate = new Date(bidm.date_created);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      const dateMatches = (!fromDate || bidmDate >= fromDate) && 
                         (!toDate || bidmDate <= toDate);

      // Filter by project name
      const projectMatches = !filters.department || 
                           bidm.number.toLowerCase().includes(filters.department.toLowerCase());

      // Filter by status
      const statusMatches = !filters.status || 
                           bidm.status === filters.status;

      return dateMatches && projectMatches && statusMatches;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmp.length / this.itemsPerPage);
    this.updateDisplayedPpmp();
  }

  reviewBids(bidm: BIDM): void {
    this.selectedBid = bidm;
    this.showReviewModal = true;
    this.currentOpenActionId = null;
  }

  handleFilterChange(filters: any): void {
    this.applyPpmpFilters(filters);
  }

  updateDisplayedBidm(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedBidm = this.bidmData.slice(start, end);
  }
}
