import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { APpmpfilterComponent } from "./a-ppmpfilter/a-ppmpfilter.component";
import { DPpmprejectedprocurementComponent } from "./d-ppmprejectedprocurement/d-ppmprejectedprocurement.component";
import { DPpmpapprovedprocurementComponent } from "./d-ppmpapprovedprocurement/d-ppmpapprovedprocurement.component";
import { DViewppmpprocurementComponent } from "./d-viewppmpprocurement/d-viewppmpprocurement.component";
import { SupabaseService } from '../../../core/services/supabase.service';

interface PPMP {
  project_id: number;
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
    DPpmpapprovedprocurementComponent,
    DViewppmpprocurementComponent
  ],
  templateUrl: './u-ppmpmanagement.component.html',
  styleUrls: ['./u-ppmpmanagement.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UPpmpmanagement implements OnInit {
  ppmpData: PPMP[] = [];
  displayedPpmp: PPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: 'pending' | 'approved' | 'rejected' = 'pending';
  isLoading: boolean = true;
  showViewModal: boolean = false;
  selectedProjectId: number | null = null;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService) {}
  ngOnInit(): void {
    this.loadPpmpRecords();
  }

  async loadPpmpRecords() {
    this.isLoading = true;
    const data = await this.supabaseService.getPPMPManagementData('Pending');
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
    this.currentOpenActionId = this.currentOpenActionId === ppmp.project_id ? null : ppmp.project_id;
  }

  switchView(view: 'pending' | 'approved' | 'rejected'): void {
    this.currentView = view;
    this.currentPage = 1;
    this.updateDisplayedPpmp();
  }

    viewPpmp(ppmp: PPMP): void {
    this.selectedProjectId = ppmp.project_id;
    this.showViewModal = true;
    this.currentOpenActionId = null; // Close the actions dropdown
  }

    closeViewModal(): void {
    this.showViewModal = false;
    this.selectedProjectId = null;
    setTimeout(() => this.showViewModal = true, 0);
  }

  editPpmp(ppmp: PPMP): void {
    this.router.navigate(['/user/d-updateppmprocurement', ppmp.project_id]);
  }

  // submitPpmp(ppmp: PPMP): void {
  //   ppmp.status = 'Pending';
  //   this.updateDisplayedPpmp();
  //   this.currentOpenActionId = null;
  // }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedPpmp = this.ppmpData.filter(ppmp =>
      ppmp.project_name.toLowerCase().includes(searchTerm) //||
      // ppmp.requested_items.some(item => item.toLowerCase().includes(searchTerm))
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
