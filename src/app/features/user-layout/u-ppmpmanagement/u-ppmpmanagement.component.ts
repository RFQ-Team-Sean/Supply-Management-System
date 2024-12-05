import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { APpmpfilterComponent } from "./a-ppmpfilter/a-ppmpfilter.component";
import { DPpmprejectedprocurementComponent } from "./d-ppmprejectedprocurement/d-ppmprejectedprocurement.component";
import { DPpmpapprovedprocurementComponent } from "./d-ppmpapprovedprocurement/d-ppmpapprovedprocurement.component";
import { SupabaseService } from '../../../core/services/supabase.service';

interface PPMP {
  id: number;
  project_name: string;
  requested_items: string;
  total_budget: number;
  date_created: string;
  status: string;
}

@Component({
  selector: 'app-u-ppmpmanagement',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    APpmpfilterComponent,
    DPpmprejectedprocurementComponent,
    DPpmpapprovedprocurementComponent
  ],
  templateUrl: './u-ppmpmanagement.component.html',
  styleUrls: ['./u-ppmpmanagement.component.css']
})
export class UPpmpmanagement implements OnInit {
  ppmpData: PPMP[] = [];
  displayedPpmp: PPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: 'pending' | 'approved' | 'rejected' = 'pending';

  // booleans
  isLoading: boolean = true;

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    // this.initializeDummyData();
    this.loadPpmpRecords();
  }

  // initializeDummyData(): void {
  //   this.ppmpData = [
  //     { 
  //       id: 1, 
  //       project_name: 'IT Equipment Procurement', 
  //       requested_items: ['Desktop Computers'],
  //       total_budget: 250000.22, 
  //       date_created: '2024-01-15', 
  //       status: 'Pending' 
  //     },
  //     { 
  //       id: 2, 
  //       project_name: 'Office Supplies', 
  //       requested_items: ['Bond Papers', 'Ballpens'],
  //       total_budget: 180000.00, 
  //       date_created: '2024-02-10', 
  //       status: 'Draft' 
  //     },
  //     { 
  //       id: 3, 
  //       project_name: 'Laboratory Equipment', 
  //       requested_items: ['Microscopes', 'Test Tubes'],
  //       total_budget: 350000.00, 
  //       date_created: '2024-03-05', 
  //       status: 'Pending' 
  //     },
  //     { 
  //       id: 4, 
  //       project_name: 'Classroom Furniture', 
  //       requested_items: ['Student Chairs', 'Teachers Tables'],
  //       total_budget: 420000.00, 
  //       date_created: '2024-03-20', 
  //       status: 'Draft' 
  //     },
  //     { 
  //       id: 5, 
  //       project_name: 'Sports Equipment', 
  //       requested_items: ['Basketballs', 'Volleyballs'],
  //       total_budget: 550000.00, 
  //       date_created: '2024-04-15', 
  //       status: 'Pending' 
  //     },
  //     { 
  //       id: 6, 
  //       project_name: 'Library Books', 
  //       requested_items: ['Science Textbooks'],
  //       total_budget: 280000.00, 
  //       date_created: '2024-05-01', 
  //       status: 'Draft' 
  //     },
  //     { 
  //       id: 7, 
  //       project_name: 'Security System Upgrade', 
  //       requested_items: ['CCTV Cameras', 'DVR System'],
  //       total_budget: 150000.00, 
  //       date_created: '2024-06-18', 
  //       status: 'Pending' 
  //     },
  //     { 
  //       id: 8, 
  //       project_name: 'Cafeteria Equipment', 
  //       requested_items: ['Industrial Stove'],
  //       total_budget: 200000.00, 
  //       date_created: '2024-07-25', 
  //       status: 'Draft' 
  //     }
  //   ];
  //   this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
  // }

  async loadPpmpRecords() {
    this.isLoading = true;
    const data = await this.supabaseService.getPPMPManagementData();
    if (data) {
      this.ppmpData = data;
    }
    this.isLoading = false;
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
    this.updateDisplayedPpmp();
  }


  updateDisplayedPpmp(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmp = this.ppmpData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPpmp();
  }

  toggleActions(ppmp: PPMP): void {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.id ? null : ppmp.id;
  }

  switchView(view: 'pending' | 'approved' | 'rejected'): void {
    this.currentView = view;
    this.currentPage = 1;
    this.updateDisplayedPpmp();
  }

  viewPpmp(ppmp: PPMP): void {
    this.router.navigate(['/user/u-ppmpviewdetails', ppmp.id]);
  }

  editPpmp(ppmp: PPMP): void {
    this.router.navigate(['/user/u-ppmpedit', ppmp.id]);
  }

  submitPpmp(ppmp: PPMP): void {
    ppmp.status = 'Pending';
    this.updateDisplayedPpmp();
    this.currentOpenActionId = null;
  }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedPpmp = this.ppmpData.filter(ppmp => 
      ppmp.project_name.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.updateDisplayedPpmp();
  }

  applyPpmpFilters(filters: any): void {
    this.displayedPpmp = this.ppmpData.filter(ppmp => {
      // Filter by date range
      const ppmpDate = new Date(ppmp.date_created);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      const dateMatches = (!fromDate || ppmpDate >= fromDate) && 
                         (!toDate || ppmpDate <= toDate);

      // Filter by project name
      const projectMatches = !filters.department || 
                           ppmp.project_name.toLowerCase().includes(filters.department.toLowerCase());

      // Filter by status
      const statusMatches = !filters.status || 
                           ppmp.status === filters.status;

      return dateMatches && projectMatches && statusMatches;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmp.length / this.itemsPerPage);
    this.updateDisplayedPpmp();
  }

  handlePPMPClick() {
    this.router.navigate(['/user/u-ppmpmanagement/create']);
  }

  
}
