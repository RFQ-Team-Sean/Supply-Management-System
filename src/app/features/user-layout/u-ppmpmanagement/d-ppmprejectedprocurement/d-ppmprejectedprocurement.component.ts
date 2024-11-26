import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PPMP {
  id: number;
  project_name: string;
  requested_items: string[];
  total_budget: number;
  date_rejected: string;
  status: string;
}

@Component({
  selector: 'app-d-ppmprejectedprocurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d-ppmprejectedprocurement.component.html',
  styleUrl: './d-ppmprejectedprocurement.component.css'
})
export class DPpmprejectedprocurementComponent implements OnInit {
  // Updated Dummy Data
  ppmps: PPMP[] = [
    {
      id: 1,
      project_name: 'IT Equipment Procurement',
      requested_items: ['Desktop Computers', 'Laptops'],
      total_budget: 150000,
      date_rejected: '2024-03-15',
      status: 'Rejected'
    },
    {
      id: 2,
      project_name: 'Office Supplies',
      requested_items: ['Bond Papers', 'Ballpens'],
      total_budget: 75000,
      date_rejected: '2024-03-14',
      status: 'Rejected'
    },
    {
      id: 3,
      project_name: 'Laboratory Equipment',
      requested_items: ['Microscopes', 'Test Tubes'],
      total_budget: 500000,
      date_rejected: '2024-03-13',
      status: 'Rejected'
    },
    {
      id: 4,
      project_name: 'Classroom Furniture',
      requested_items: ['Student Chairs', 'Teachers Tables'],
      total_budget: 250000,
      date_rejected: '2024-03-12',
      status: 'Rejected'
    },
    {
      id: 5,
      project_name: 'Sports Equipment',
      requested_items: ['Basketballs', 'Volleyballs', 'Soccer Balls'],
      total_budget: 80000,
      date_rejected: '2024-03-11',
      status: 'Rejected'
    },
    {
      id: 6,
      project_name: 'Library Books',
      requested_items: ['Science Textbooks'],
      total_budget: 120000,
      date_rejected: '2024-03-10',
      status: 'Rejected'
    },
    {
      id: 7,
      project_name: 'Security System Upgrade',
      requested_items: ['CCTV Cameras', 'DVR System'],
      total_budget: 350000,
      date_rejected: '2024-03-09',
      status: 'Rejected'
    },
    {
      id: 8,
      project_name: 'Cafeteria Equipment',
      requested_items: ['Industrial Stove', 'Refrigerator'],
      total_budget: 200000,
      date_rejected: '2024-03-08',
      status: 'Rejected'
    },
    {
      id: 9,
      project_name: 'Audio-Visual Equipment',
      requested_items: ['Projectors', 'Speakers'],
      total_budget: 180000,
      date_rejected: '2024-03-07',
      status: 'Rejected'
    },
    {
      id: 10,
      project_name: 'Maintenance Tools',
      requested_items: ['Power Tools', 'Hand Tools'],
      total_budget: 95000,
      date_rejected: '2024-03-06',
      status: 'Rejected'
    }
  ];

  displayedPpmps: PPMP[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;

  ngOnInit() {
    this.updateDisplayedPpmps();
  }

  updateDisplayedPpmps() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmps = this.ppmps.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.ppmps.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedPpmps = this.ppmps.filter(ppmp => 
      ppmp.project_name.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmps.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPpmps();
    }
  }

  toggleActions(ppmp: PPMP) {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.id ? null : ppmp.id;
  }

  viewPpmp(ppmp: PPMP) {
    console.log('Viewing PPMP:', ppmp);
    // Implement view logic
  }

  editPpmp(ppmp: PPMP) {
    console.log('Editing PPMP:', ppmp);
    // Implement edit logic
  }

  resubmitPpmp(ppmp: PPMP) {
    console.log('Resubmitting PPMP:', ppmp);
    // Implement resubmit logic
  }
}
