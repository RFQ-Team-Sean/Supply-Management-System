// app-shared.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CrudService } from 'src/app/services/crud.service';
import { APP, PPMPItem, PPMPProject, Users, Office, ProcurementMode, FundSource } from 'src/app/schema/schema';

export interface ProcurementItem {
  id: string;
  program: string;
  endUser: string;
  procurementMode: string;
  advertisementDate: Date | string;
  submissionDate: Date | string;
  awardDate: Date | string;
  signingDate: Date | string;
  fundSource: string;
  totalBudget: number;
  mooe: number;
  co: number;
  remarks: string;
}

export interface ProcurementCategory {
  name: string;
  fund: string;
  items: ProcurementItem[];
}

@Component({
  selector: 'app-app-shared',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-shared.component.html',
  styleUrl: './app-shared.component.scss'
})
export class AppSharedComponent implements OnInit {
  documentData: any;
  editMode = false;
  selectedItem: ProcurementItem | null = null;
  currentYear: number = new Date().getFullYear();
  isEditing = false;
  categories: ProcurementCategory[] = [];
  quarter: number = Math.floor((new Date().getMonth() + 3) / 3);
  fiscalYear: number = new Date().getFullYear();
  
  preparedBy: any = {
    name: 'Department Head',
    position: 'Head of Office'
  };
  
  approvedBy: any = {
    name: 'University President',
    position: 'President'
  };
  
  committeeMembers: any[] = [
    { name: 'BAC Chairperson', position: 'Chairperson' },
    { name: 'BAC Member 1', position: 'Member' },
    { name: 'BAC Member 2', position: 'Member' }
  ];

  constructor(
    private route: ActivatedRoute,
    private crudService: CrudService
  ) {}

  async ngOnInit() {
    // Subscribe to route query params to get the APP ID
    this.route.queryParams.subscribe(async params => {
      const appId = params['id'];
      
      if (appId) {
        await this.loadAppData(appId);
      }
    });
  }
  
  async loadAppData(appId: string) {
    try {
      // Load the APP document
      const app = await this.crudService.get<APP>(APP, appId);
      
      if (!app) {
        console.error('APP document not found');
        return;
      }
      
      this.fiscalYear = app.fiscal_year;
      
      // Get related data using forJoin
      const [
        fundSources,
        users,
        offices,
        projects,
        items,
        modes
      ] = await this.crudService.forJoin(
        FundSource,
        Users,
        Office,
        PPMPProject,
        PPMPItem,
        ProcurementMode
      );
      
      // Get prepared by user
      const preparedByUser = users.find(u => u.id === app.prepared_by);
      if (preparedByUser) {
        this.preparedBy = {
          name: preparedByUser.fullname,
          position: preparedByUser.position || 'Department Head'
        };
      }
      
      // Set approver (president or admin)
      const approver = users.find(u => u.role === 'president' || u.role === 'superadmin');
      if (approver) {
        this.approvedBy = {
          name: approver.fullname,
          position: approver.position || 'University President'
        };
      }
      
      // Set committee members (BAC members)
      const bacMembers = users.filter(u => u.role === 'bac').slice(0, 3);
      if (bacMembers.length > 0) {
        this.committeeMembers = bacMembers.map(member => ({
          name: member.fullname,
          position: member.position || 'BAC Member'
        }));
      }
      
      // Find PPMP projects related to this APP
      const relatedProjects = projects.filter(p => p.app_id === appId);
      
      // Process each project to create categories
      this.categories = [];
      
      for (const project of relatedProjects) {
        const fundSource = fundSources.find(fs => fs.id === app.fund_source);
        const fundSourceName = fundSource ? fundSource.source_name : 'General Fund';
        
        const office = offices.find(o => o.id === project.PPMP?.office_id);
        const officeName = office ? office.name : 'Main Office';
        
        const procMode = modes.find(m => m.id === project.procurement_mode_id);
        const procModeName = procMode ? procMode.mode_name : 'Public Bidding';
        
        // Get items for this project
        const projectItems = items.filter(item => item.ppmp_project_id === project.id);
        
        // Create category
        const category: ProcurementCategory = {
          name: officeName,
          fund: fundSourceName,
          items: projectItems.map(item => {
            // Create schedule with reasonable dates
            const baseDate = new Date(this.fiscalYear, 0, 1);
            const advertisementDate = new Date(baseDate);
            advertisementDate.setDate(advertisementDate.getDate() + 30);
            
            const submissionDate = new Date(advertisementDate);
            submissionDate.setDate(submissionDate.getDate() + 15);
            
            const awardDate = new Date(submissionDate);
            awardDate.setDate(awardDate.getDate() + 7);
            
            const signingDate = new Date(awardDate);
            signingDate.setDate(signingDate.getDate() + 7);
            
            return {
              id: item.id,
              program: item.technical_specification || 'Procurement Program',
              endUser: officeName,
              procurementMode: procModeName,
              advertisementDate: advertisementDate,
              submissionDate: submissionDate, 
              awardDate: awardDate,
              signingDate: signingDate,
              fundSource: fundSourceName,
              totalBudget: item.estimated_total_cost,
              mooe: item.classification === 'goods' ? item.estimated_total_cost : 0,
              co: item.classification === 'infrastructure' ? item.estimated_total_cost : 0,
              remarks: project.PPMP?.remarks || ''
            };
          })
        };
        
        this.categories.push(category);
      }
      
      // If no related projects were found, create a default category with APP data
      if (this.categories.length === 0) {
        const fundSource = fundSources.find(fs => fs.id === app.fund_source);
        const fundSourceName = fundSource ? fundSource.source_name : 'General Fund';
        
        this.categories = [{
          name: 'University Main Campus',
          fund: fundSourceName,
          items: [{
            id: app.id,
            program: 'Annual Procurement Plan',
            endUser: 'University',
            procurementMode: 'Public Bidding',
            advertisementDate: new Date(this.fiscalYear, 0, 15),
            submissionDate: new Date(this.fiscalYear, 1, 1),
            awardDate: new Date(this.fiscalYear, 1, 15),
            signingDate: new Date(this.fiscalYear, 2, 1),
            fundSource: fundSourceName,
            totalBudget: app.total_estimated_cost,
            mooe: app.total_estimated_cost * 0.7, // Estimate 70% for MOOE
            co: app.total_estimated_cost * 0.3,  // Estimate 30% for CO
            remarks: ''
          }]
        }];
      }
      
    } catch (error) {
      console.error('Error loading APP data:', error);
    }
  }
 
  getTotalBudget(): number {
    return this.categories.reduce((sum, category) => 
      sum + category.items.reduce((catSum, item) => catSum + item.totalBudget, 0), 0);
  }

  getTotalMOOE(): number {
    return this.categories.reduce((sum, category) => 
      sum + category.items.reduce((catSum, item) => catSum + item.mooe, 0), 0);
  }

  getTotalCO(): number {
    return this.categories.reduce((sum, category) => 
      sum + category.items.reduce((catSum, item) => catSum + item.co, 0), 0);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.isEditing = this.editMode;
  }

  onItemClick(category: number, item: number): void {
    if (this.editMode) {
      this.selectedItem = this.categories[category].items[item];
    }
  }

  calculateCategoryTotals(category: ProcurementCategory) {
    const totals = {
      totalBudget: 0,
      totalMOOE: 0,
      totalCO: 0
    };

    if (category && category.items) {
      category.items.forEach(item => {
        totals.totalBudget += item.totalBudget || 0;
        totals.totalMOOE += item.mooe || 0;
        totals.totalCO += item.co || 0;
      });
    }

    return totals;
  }

  calculateGrandTotal() {
    return {
      totalBudget: this.getTotalBudget(),
      totalMOOE: this.getTotalMOOE(),
      totalCO: this.getTotalCO()
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-PH', {
      month: 'short',
      year: 'numeric'
    });
  }

  get formattedQuarter(): string {
    if (!this.quarter) return '';
    
    switch (this.quarter) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      case 4:
        return '4th';
      default:
        return '';
    }
  }

  async exportToPDF(): Promise<void> {
    const element = document.querySelector('.app-document');
    if (!element) return;
  
    try {
      // Hide export button before capturing
      const exportBtn = document.querySelector('.export-button-container');
      if (exportBtn) {
        (exportBtn as HTMLElement).style.display = 'none';
      }
  
      // Set background color
      const originalBackground = (element as HTMLElement).style.background;
      (element as HTMLElement).style.background = 'white';
  
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
  
      // Restore styles
      (element as HTMLElement).style.background = originalBackground;
      if (exportBtn) {
        (exportBtn as HTMLElement).style.display = 'flex';
      }
  
      // Calculate dimensions for landscape A4
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = 210; // A4 landscape height in mm
      const aspectRatio = canvas.height / canvas.width;
      const pdfWidth = imgWidth;
      const pdfHeight = pdfWidth * aspectRatio;
  
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
  
      // Handle multiple pages if content is too long
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      while (position < pdfHeight) {
        // Add new page if needed, but not for first page
        if (position > 0) {
          pdf.addPage();
        }
  
        // Calculate remaining height
        const remainingHeight = pdfHeight - position;
        const currentHeight = Math.min(pageHeight, remainingHeight);
  
        // Add portion of image to current page
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
  
        // Move to next portion
        position += pageHeight;
      }
  
      // Save the PDF
      pdf.save(`annual-procurement-plan-${this.formattedQuarter}-quarter-${this.fiscalYear}.pdf`);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }
}