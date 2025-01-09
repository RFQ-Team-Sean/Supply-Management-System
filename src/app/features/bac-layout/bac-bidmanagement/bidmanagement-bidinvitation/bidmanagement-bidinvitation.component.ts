import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BIDM {
  id: number;
  number: string;
  supplier_name: string;
  send_date: string;
  status: string;
  invitation_status: string;
}

@Component({
  selector: 'app-bidmanagement-bidinvitation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bidmanagement-bidinvitation.component.html',
  styleUrl: './bidmanagement-bidinvitation.component.css'
})
export class BidmanagementBidinvitationComponent implements OnInit {
  bidms: BIDM[] = [
    {
      id: 1,
      number: 'SUP-001',
      supplier_name: 'ABC Computer Solutions',
      send_date: '2024-03-15',
      status: 'Sent',
      invitation_status: 'Pending Response'
    },
    {
      id: 2,
      supplier_name: 'Office Plus Supplies',
      number: 'SUP-002',
      send_date: '2024-03-14',
      status: 'Sent',
      invitation_status: 'Accepted'
    },
    {
      id: 3,
      supplier_name: 'Lab Equipment Co.',
      number: 'SUP-003',
      send_date: '2024-03-13',
      status: 'Sent',
      invitation_status: 'Declined'
    },
    {
      id: 4,
      supplier_name: 'School Furniture Inc.',
      number: 'SUP-004',
      send_date: '2024-03-12',
      status: 'Draft',
      invitation_status: 'Not Sent'
    },
    {
      id: 5,
      supplier_name: 'Sports Equipment Plus',
      number: 'SUP-005',
      send_date: '2024-03-11',
      status: 'Sent',
      invitation_status: 'Pending Response'
    }
  ];

  displayedBidms: BIDM[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;

  ngOnInit() {
    this.updateDisplayedBidms();
  }

  updateDisplayedBidms() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBidms = this.bidms.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.bidms.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedBidms = this.bidms.filter(bidm => 
      bidm.supplier_name.toLowerCase().includes(searchTerm) ||
      bidm.number.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedBidms.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedBidms();
    }
  }

  toggleActions(bidm: BIDM) {
    this.currentOpenActionId = this.currentOpenActionId === bidm.id ? null : bidm.id;
  }

  viewBidm(bidm: BIDM) {
    console.log('Viewing Bid Invitation:', bidm);
  }

  sendInvitation(bidm: BIDM) {
    console.log('Sending Invitation to:', bidm);
    this.currentOpenActionId = null;
  }
}