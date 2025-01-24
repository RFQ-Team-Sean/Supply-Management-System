import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BIDE {
  id: number;
  number: string;
  purchase_request_item: string;
  supplier: string;
  total_score: string;
  amount_submitted: string;
  evaluation_status: string;
  status: string;
}

@Component({
  selector: 'app-bidevaluation-winningbid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bidevaluation-winningbid.component.html',
  styleUrl: './bidevaluation-winningbid.component.css'
})
export class BidevaluationWinningbidComponent implements OnInit {
  bidms: BIDE[] = [
    {
      id: 1,
      number: 'BID-001',
      purchase_request_item: 'Desktop Computers',
      supplier: 'Tech Solutions Inc.',
      total_score: '95.5',
      amount_submitted: '₱1,500,000.00',
      evaluation_status: 'Passed',
      status: 'Approve'
    },
    {
      id: 2,
      number: 'BID-002',
      purchase_request_item: 'Office Furniture',
      supplier: 'Office Solutions Co.',
      total_score: '88.7',
      amount_submitted: '₱800,000.00',
      evaluation_status: 'Failed',
      status: 'Reject'
    },
    {
      id: 3,
      number: 'BID-003',
      purchase_request_item: 'Laboratory Equipment',
      supplier: 'Lab Supplies Inc.',
      total_score: '92.3',
      amount_submitted: '₱2,000,000.00',
      evaluation_status: 'Passed',
      status: 'Pending'
    },
    {
      id: 4,
      number: 'BID-004',
      purchase_request_item: 'Medical Equipment',
      supplier: 'MedTech Solutions',
      total_score: '91.8',
      amount_submitted: '₱3,500,000.00',
      evaluation_status: 'Passed',
      status: 'Approve'
    },
    {
      id: 5,
      number: 'BID--005',
      purchase_request_item: 'Network Equipment',
      supplier: 'Network Systems Corp',
      total_score: '89.5',
      amount_submitted: '₱1,200,000.00',
      evaluation_status: 'Failed',
      status: 'Reject'
    },
    {
      id: 6,
      number: 'BID-006',
      purchase_request_item: 'Air Conditioning Units',
      supplier: 'Cool Air Solutions',
      total_score: '87.9',
      amount_submitted: '₱900,000.00',
      evaluation_status: 'Passed',
      status: 'Pending'
    },
    {
      id: 7,
      number: 'BID--007',
      purchase_request_item: 'Security Cameras',
      supplier: 'Security Tech Corp',
      total_score: '93.2',
      amount_submitted: '₱750,000.00',
      evaluation_status: 'Failed',
      status: 'Reject'
    },
    {
      id: 8,
      number: 'BID-008',
      purchase_request_item: 'Office Supplies',
      supplier: 'Office Depot Inc.',
      total_score: '86.5',
      amount_submitted: '₱500,000.00',
      evaluation_status: 'Passed',
      status: 'Approve'
    },
    {
      id: 9,
      number: 'BID-009',
      purchase_request_item: 'Server Equipment',
      supplier: 'Data Systems Ltd.',
      total_score: '94.7',
      amount_submitted: '₱2,800,000.00',
      evaluation_status: 'Failed',
      status: 'Pending'
    },
    {
      id: 10,
      number: 'BID-010',
      purchase_request_item: 'Audio Visual Equipment',
      supplier: 'AV Solutions Corp',
      total_score: '90.1',
      amount_submitted: '₱1,800,000.00',
      evaluation_status: 'Passed',
      status: 'Approve'
    }
  ];

  displayedBides: BIDE[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;

  ngOnInit() {
    this.updateDisplayedBides();
  }

  updateDisplayedBides() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBides = this.bidms.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.bidms.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedBides = this.bidms.filter(bidm => 
      bidm.supplier.toLowerCase().includes(searchTerm) ||
      bidm.number.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedBides.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedBides();
    }
  }

  toggleActions(bide: BIDE) {
    this.currentOpenActionId = this.currentOpenActionId === bide.id ? null : bide.id;
  }

  approveBide(bide: BIDE) {
    console.log('Approving bid:', bide);
    this.currentOpenActionId = null;
  }

  rejectBide(bide: BIDE) {
    console.log('Rejecting bid:', bide);
    this.currentOpenActionId = null;
  }
}