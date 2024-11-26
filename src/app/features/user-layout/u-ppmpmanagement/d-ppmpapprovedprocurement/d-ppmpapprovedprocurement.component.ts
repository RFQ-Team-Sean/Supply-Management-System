import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ApprovedPPMP {
  id: number;
  project_name: string;
  requested_items: string[];
  total_budget: number;
  approved_date: string;
  status: string;
}

@Component({
  selector: 'app-d-ppmpapprovedprocurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d-ppmpapprovedprocurement.component.html',
  styleUrl: './d-ppmpapprovedprocurement.component.css'
})
export class DPpmpapprovedprocurementComponent implements OnInit {
  ppmpData: ApprovedPPMP[] = [];
  displayedPpmps: ApprovedPPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.updateDisplayedPpmps();
  }

  initializeDummyData(): void {
    this.ppmpData = [
      { 
        id: 1, 
        project_name: 'IT Equipment Procurement', 
        requested_items: ['Desktop Computers', 'Laptops'],
        total_budget: 250000.00, 
        approved_date: '2024-01-20', 
        status: 'Approved' 
      },
      { 
        id: 2, 
        project_name: 'Office Supplies', 
        requested_items: ['Bond Papers', 'Ballpens'],
        total_budget: 180000.00, 
        approved_date: '2024-02-15', 
        status: 'Approved' 
      },
      { 
        id: 3, 
        project_name: 'Laboratory Equipment', 
        requested_items: ['Microscopes', 'Test Tubes'],
        total_budget: 350000.00, 
        approved_date: '2024-03-10', 
        status: 'Approved' 
      },
      { 
        id: 4, 
        project_name: 'Classroom Furniture', 
        requested_items: ['Student Chairs', 'Teachers Tables'],
        total_budget: 420000.00, 
        approved_date: '2024-03-25', 
        status: 'Approved' 
      },
      { 
        id: 5, 
        project_name: 'Sports Equipment', 
        requested_items: ['Basketballs', 'Volleyballs', 'Soccer Balls', 'Tennis Rackets'],
        total_budget: 550000.00, 
        approved_date: '2024-04-20', 
        status: 'Approved' 
      },
      { 
        id: 6, 
        project_name: 'Library Books', 
        requested_items: ['Science Textbooks', 'Literature Books', 'Reference Materials'],
        total_budget: 280000.00, 
        approved_date: '2024-05-05', 
        status: 'Approved' 
      },
      { 
        id: 7, 
        project_name: 'Security System Upgrade', 
        requested_items: ['CCTV Cameras', 'DVR System', 'Access Control Devices'],
        total_budget: 150000.00, 
        approved_date: '2024-06-22', 
        status: 'Approved' 
      },
      { 
        id: 8, 
        project_name: 'Cafeteria Equipment', 
        requested_items: ['Industrial Stove', 'Refrigerator', 'Food Warmers'],
        total_budget: 200000.00, 
        approved_date: '2024-07-30', 
        status: 'Approved' 
      }
    ];
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
  }

  updateDisplayedPpmps(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmps = this.ppmpData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPpmps();
  }

  toggleActions(ppmp: ApprovedPPMP): void {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.id ? null : ppmp.id;
  }

  viewPpmp(ppmp: ApprovedPPMP): void {
    this.router.navigate(['/user/u-ppmpviewdetails', ppmp.id]);
  }

  printPpmp(ppmp: ApprovedPPMP): void {
    // Implement print functionality
    console.log('Printing PPMP:', ppmp);
  }

  searchLogs(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedPpmps = this.ppmpData.filter(ppmp => 
      ppmp.project_name.toLowerCase().includes(searchTerm) ||
      ppmp.requested_items.some(item => item.toLowerCase().includes(searchTerm))
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmps.length / this.itemsPerPage);
  }
}
