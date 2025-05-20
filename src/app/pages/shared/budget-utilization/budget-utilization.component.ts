import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BudgetService } from 'src/app/services/budget.service';
import { RFQService } from 'src/app/services/rfq.service';
import { RequisitionService } from 'src/app/services/requisition.service';
import { UserService } from 'src/app/services/user.service';
import { DepartmentService } from 'src/app/services/departments.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bur',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './budget-utilization.component.html',
  styleUrls: ['./budget-utilization.component.scss'],
})
export class BudgetUtilizationComponent implements OnChanges {
  @Input() rfqId: string = ''; // Input property for RFQ ID
  mockData: any = {}; // Placeholder for the mock data

  constructor(
    private budgetService: BudgetService,
    private rfqService: RFQService,
    private requisitionService: RequisitionService,
    private userService: UserService,
    private departmentService: DepartmentService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rfqId'] && this.rfqId) {
      // this.loadRFQData();
    }
  }

  // async loadRFQData() {
  //   if (!this.rfqId) {
  //     alert('RFQ ID is required.');
  //     return;
  //   }

  //   try {
  //     const rfq = await this.rfqService.getById(this.rfqId);
  //     if (rfq) {
  //       await this.populateMockData(rfq);
  //     } else {
  //       alert('RFQ not found.');
  //     }
  //   } catch (error) {
  //     console.error('Error loading RFQ data:', error);
  //   }
  // }

  // async populateMockData(rfq: any) {
  //   try {
  //     const requisition = await this.requisitionService.getRequisitionById(rfq.purchase_order || '');
  //     console.log('Requisition:', requisition);

  //     const createdByUser = this.userService.getUserById(requisition?.createdByUserId || '');
  //     console.log('Created By User:', createdByUser);

  //     if (!createdByUser) {
  //       alert('User not found.');
  //       return;
  //     }

  //     const offices = await this.departmentService.getAllOffices();
  //     const office = offices.find((o) => o.id === createdByUser.officeId);
  //     console.log('Office:', office);

  //     if (!office) {
  //       alert('Office not found for the user.');
  //       return;
  //     }

  //     const departments = await this.departmentService.getAllDepartments();
  //     const department = departments.find((d) => d.id === office.departmentId);
  //     console.log('Department:', department);

  //     if (!department) {
  //       alert('Department not found for the office.');
  //       return;
  //     }

  //     const budgets = (await this.budgetService.getAllBudgetAllocations().toPromise()) || [];
  //     if (!budgets.length) {
  //       alert('No budgets found.');
  //       return;
  //     }

  //     const budget = budgets.find((b) => b.departmentId === department.id);
  //     console.log('Budget:', budget);

  //     if (!budget) {
  //       alert('No budget found for this department.');
  //       return;
  //     }

  //     const loggedInUser = this.userService.getUser();
  //     const certifiedByName = loggedInUser?.fullname || 'N/A';
  //     const certifiedByPosition = loggedInUser?.position || 'N/A';

  //     this.mockData = {
  //       title: 'ANNEX C',
  //       subtitle: 'LOCAL GOVERNMENT SUPPORT FUND',
  //       reportTitle: 'Report on Fund Utilization and Status of Program/Project Implementation',
  //       quarterEnded: 'For the Quarter Ended ______',
  //       tableHeaders: [
  //         'Fund Source',
  //         'Date of Notice of Authority to Debit Account Issued (NADAI)',
  //         'Type of Program/ Project',
  //         'Name/Title of Program/ Project',
  //         'Specific Location',
  //         'Mechanism/ Mode of Implementation',
  //         'Estimated Number of Beneficiaries',
  //         'Amount',
  //         'Estimated Period of Completion (month and year)',
  //         'Remarks on Program/ Project Status',
  //       ],
  //       tableData: [
  //         {
  //           fundSource: `Budget ID: ${budget?.id || 'N/A'}`,
  //           nadaiDate: requisition?.dateCreated
  //             ? new Date(requisition.dateCreated).toLocaleDateString()
  //             : 'N/A',
  //           programType: 'Infrastructure',
  //           programTitle: requisition?.title || 'N/A',
  //           location: `${office.roomNumber || 'N/A'}, Floor ${office.floor || 'N/A'}, ${
  //             office.name || 'N/A'
  //           }`,
  //           implementationMode: 'Contractor',
  //           beneficiaries: requisition?.products.reduce((sum, product) => sum + product.quantity, 0),
  //           amountReceived: `${budget?.totalBudget || 0}`,
  //           amountContracted: `${budget?.allocatedAmount || 0}`,
  //           amountDisbursed: `${budget?.totalBudget - budget?.remainingBalance || 0}`,
  //           completionPeriod: 'December 2025',
  //           remarks: 'Ongoing',
  //         },
  //       ],
  //       certifiedBy: {
  //         name: certifiedByName,
  //         position: certifiedByPosition,
  //       },
  //       attestedBy: {
  //         chiefExecutive: 'Local Chief Executive',
  //         planningCoordinator: 'Local Planning and Development Coordinator',
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error populating mock data:', error);
  //     alert('An error occurred while loading data.');
  //   }
  // }

  exportPdf() {
    const content = document.querySelector('.app-bur') as HTMLElement;

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('budget-utilization-report.pdf');
    });
  }
}
