import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApexChart,
  ApexAxisChartSeries as ApexSeries,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTitleSubtitle,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { RFQService } from 'src/app/services/rfq.service';
import { PurchaseRequestService, PurchaseRequest } from 'src/app/services/purchase-request.service';
import { BudgetService, BudgetAllocation } from 'src/app/services/budget.service'; // Import BudgetService and BudgetAllocation


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    ScrollPanelModule,
    CalendarModule,
    CommonModule,
    FormsModule,
    NgApexchartsModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  platformId = inject(PLATFORM_ID);
  lineChartData: any;

  // First chart options (RFQ data)
  public lineChartOptions: {
    series: ApexSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: [],
      title: {
        text: '',
      },
    },
    yaxis: {
      title: {
        text: '',
      },
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: '',
      align: 'left',
    },
  };

  public budgetChartOptions: {
    series: ApexSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: [],
      title: {
        text: '',
      },
    },
    yaxis: {
      title: {
        text: '',
      },
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: '',
      align: 'left',
    },
  };

  // Second chart options (Purchase Request data)
  public purchaseRequestChartOptions: {
    series: ApexSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: [],
      title: {
        text: '',
      },
    },
    yaxis: {
      title: {
        text: '',
      },
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: '',
      align: 'left',
    },
  };

  constructor(
    private rfqService: RFQService, // Inject RFQService
    private purchaseRequestService: PurchaseRequestService, // Inject PurchaseRequestService
    private budgetService: BudgetService
  ) {}

  async ngOnInit() {
    // Fetch and process RFQ data for the first chart
    const rfqs = await this.rfqService.getAll();
    const incomingData = rfqs.map((rfq) => rfq.suppliers[0]?.biddingPrice || 0);
    const categories = rfqs.map((rfq) => rfq.id || 'Unknown RFQ');
  
    await this.loadBudgetData();

    this.lineChartOptions.series = [
      {
        name: 'Incoming',
        data: incomingData,
      },
      {
        name: 'Delivered',
        data: [28, 48, 40, 19, 86, 27, 90], // Placeholder data
      },
    ];
  
    this.lineChartOptions.chart = {
      type: 'line',
      height: 330,
    };
  
    this.lineChartOptions.stroke = {
      curve: 'smooth',
    };
  
    this.lineChartOptions.title = {
      text: 'Request for Quotations',
      align: 'left',
    };
  
    this.lineChartOptions.xaxis = {
      categories: categories,
    };
  
    this.lineChartOptions.yaxis = {
      title: {
        text: 'Bidding Price',
      },
    };
  
    // Fetch and process Purchase Request data for the second chart
    const purchaseRequests = await this.purchaseRequestService.getAll();
    const approvedData = this.transformPurchaseRequestData(purchaseRequests);
  
    this.purchaseRequestChartOptions.series = [
      {
        name: 'Approved Purchase Requests',
        data: approvedData,
      },
    ];
  
    this.purchaseRequestChartOptions.chart = {
      type: 'line',
      height: 330,
    };
  
    this.purchaseRequestChartOptions.stroke = {
      curve: 'smooth',
    };
  
    this.purchaseRequestChartOptions.title = {
      text: 'Approved Purchase Requests Over Time',
      align: 'left',
    };
  
    this.purchaseRequestChartOptions.xaxis = {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Example categories (replace with actual data)
    };
  
    this.purchaseRequestChartOptions.yaxis = {
      title: {
        text: 'Number of Approved Requests',
      },
    };
  }

  private async loadBudgetData() {
    const budgets = await this.budgetService.getAllBudgetAllocations().toPromise() || [];

    // Transform budget data into chart data
    // const categories = budgets.map((budget) => budget.departmentId);
    const totalBudgetData = budgets.map((budget) => budget.totalBudget);
    const allocatedAmountData = budgets.map((budget) => budget.allocatedAmount);
    const remainingBalanceData = budgets.map((budget) => budget.remainingBalance);

    // Update the first chart options with budget data
    this.budgetChartOptions.series = [
      {
        name: 'Total Budget',
        data: totalBudgetData,
      },
      {
        name: 'Allocated Amount',
        data: allocatedAmountData,
      },
      {
        name: 'Remaining Balance',
        data: remainingBalanceData,
      },
    ];

    this.budgetChartOptions.chart = {
      type: 'line',
      height: 330,
    };

    this.budgetChartOptions.stroke = {
      curve: 'smooth',
    };

    this.budgetChartOptions.title = {
      text: 'Budget Allocation Overview',
      align: 'left',
    };

    this.budgetChartOptions.xaxis = {
      // categories: categories,
      labels:{
        show: false,
      },
      title: {
        text: 'Department',
      },
    };

    this.budgetChartOptions.yaxis = {
      title: {
        text: 'Amount (USD)',
      },
    };
  }
  
  // Transform Purchase Request data into chart data
  private transformPurchaseRequestData(purchaseRequests: PurchaseRequest[]): number[] {
    // Example: Count approved purchase requests by month
    const approvedCounts = [0, 0, 0, 0, 0, 0, 0]; // Placeholder for 7 months
    purchaseRequests.forEach((pr) => {
      if (pr.status === 'approved') {
        const month = new Date(pr.date).getMonth(); // Assuming `date` is a Date object
        if (month >= 0 && month < 7) {
          approvedCounts[month]++;
        }
      }
    });
    return approvedCounts;
  }
}