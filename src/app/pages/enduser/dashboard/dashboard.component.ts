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
  ApexStroke,
  ApexAxisChartSeries as ApexSeries,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { PurchaseRequestService } from 'src/app/services/purchase-request.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule, CardModule, ButtonModule, ScrollPanelModule, CalendarModule, CommonModule, FormsModule, NgApexchartsModule ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: any;
  options: any;
  departmentData: any;
  departmentOptions: any;
  platformId = inject(PLATFORM_ID);
  lineChartData: any;

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
      height: 350
    },
    xaxis: {
      categories: [],
      title: {
        text: ''
      }
    },
    yaxis: {
      title: {
        text: ''
      }
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: '',
      align: 'left'
    }
  };

  constructor(private purchaseRequestService: PurchaseRequestService) {} // Inject the service

  ngOnInit() {
    this.loadChartData();

    this.data = {
      labels: ['Pending', 'Approved'],
      datasets: [
        {
          data: [65, 60],
          backgroundColor: ['#42A5F5', '#ffd700'],
          hoverBackgroundColor: ['#64B5F6', '#FFEB3B']
        }
      ]
    };
  
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Total Requisitions'
        }
      }
    };
  }

  async loadChartData() {
    // Fetch purchase requests from the service
    const purchaseRequests = await this.purchaseRequestService.getAll();

    // Group purchase requests by month
    const monthlyCounts = this.groupPurchaseRequestsByMonth(purchaseRequests);

    // Update the line chart data
    this.lineChartOptions.series = [
      {
        name: "Purchase Requests",
        data: monthlyCounts
      }
    ];

    this.lineChartOptions.chart = {
      type: "line",
      height: 330
    };

    this.lineChartOptions.stroke = {
      curve: "smooth"
    };

    this.lineChartOptions.title = {
      text: "Total Purchase Requests",
      align: "left"
    };

    this.lineChartOptions.xaxis = {
      categories: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    };

    this.lineChartOptions.yaxis = {
      title: {
        text: "Number of Requests"
      }
    };
  }

  groupPurchaseRequestsByMonth(purchaseRequests: any[]): number[] {
    const monthlyCounts = new Array(12).fill(0); // Initialize an array for 12 months

    purchaseRequests.forEach(request => {
      const month = new Date(request.date).getMonth(); // Get the month (0-11)
      monthlyCounts[month]++; // Increment the count for the corresponding month
    });

    return monthlyCounts;
  }
}