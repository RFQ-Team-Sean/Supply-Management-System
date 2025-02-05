import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidinvitationMoredetailsComponent } from './bidinvitation-moredetails/bidinvitation-moredetails.component';
import { BidinvitationSendinvitationComponent } from './bidinvitation-sendinvitation/bidinvitation-sendinvitation.component';

interface BIDM {
  id: number;
  number: string;
  supplier_name: string;
  send_date: string;
  status: 'Accept' | 'Reject' | 'Pending';
  invitation_status: string;
}

@Component({
  selector: 'app-bidmanagement-bidinvitation',
  standalone: true,
  imports: [CommonModule, BidinvitationMoredetailsComponent, BidinvitationSendinvitationComponent],
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
      status: 'Pending',
      invitation_status: 'Pending'
    },
    {
      id: 2,
      supplier_name: 'Office Plus Supplies',
      number: 'SUP-002',
      send_date: '2024-03-14',
      status: 'Accept',
      invitation_status: 'Accept'
    },
    {
      id: 3,
      supplier_name: 'Lab Equipment Co.',
      number: 'SUP-003',
      send_date: '2024-03-13',
      status: 'Reject',
      invitation_status: 'Reject'
    },
    {
      id: 4,
      supplier_name: 'School Furniture Inc.',
      number: 'SUP-004',
      send_date: '2024-03-12',
      status: 'Pending',
      invitation_status: 'Not Sent'
    },
    {
      id: 5,
      supplier_name: 'Sports Equipment Plus',
      number: 'SUP-005',
      send_date: '2024-03-11',
      status: 'Accept',
      invitation_status: 'Pending Response'
    },
    {
      id: 6,
      supplier_name: 'Tech Innovations Ltd',
      number: 'SUP-006',
      send_date: '2024-03-10',
      status: 'Accept',
      invitation_status: 'Accept'
    },
    {
      id: 7,
      supplier_name: 'Global Office Supplies',
      number: 'SUP-007',
      send_date: '2024-03-09',
      status: 'Reject',
      invitation_status: 'Reject'
    },
    {
      id: 8,
      supplier_name: 'Educational Materials Co',
      number: 'SUP-008',
      send_date: '2024-03-08',
      status: 'Pending',
      invitation_status: 'Pending'
    },
    {
      id: 9,
      supplier_name: 'Laboratory Essentials',
      number: 'SUP-009',
      send_date: '2024-03-07',
      status: 'Accept',
      invitation_status: 'Accept'
    },
    {
      id: 10,
      supplier_name: 'School Supplies Direct',
      number: 'SUP-010',
      send_date: '2024-03-06',
      status: 'Reject',
      invitation_status: 'Reject'
    }
  ];

  displayedBidms: BIDM[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;
  showDetailsModal = false;
  selectedBidm: BIDM | null = null;
  showSendInvitationModal = false;

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

  moreDetailsBidm(bidm: BIDM) {
    this.selectedBidm = bidm;
    this.showDetailsModal = true;
    this.currentOpenActionId = null;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBidm = null;
  }

  sendInvitation(bidm: BIDM) {
    this.selectedBidm = bidm;
    this.showSendInvitationModal = true;
    this.currentOpenActionId = null;
  }

  closeSendInvitationModal() {
    this.showSendInvitationModal = false;
    this.selectedBidm = null;
  }
}