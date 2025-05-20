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
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries as ApexSeries,
  ApexPlotOptions,
  NgApexchartsModule,
  ApexFill,
} from 'ng-apexcharts';


@Component({
  selector: 'app-supply-dashboard',
  standalone: true,
  imports: [ChartModule, CardModule, ButtonModule, ScrollPanelModule, CalendarModule, CommonModule, FormsModule, NgApexchartsModule ],
  templateUrl: './supply-dashboard.component.html',
  styleUrls: ['./supply-dashboard.component.scss']
})
export class SupplyDashboardComponent implements OnInit {
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
  
  ngOnInit() {
    this.data = {
      labels: ['Laptop', 'Mouse', 'Keyboard', 'Bond Paper', 'Paper Clip'],
      datasets: [
        {
          data: [65, 60, 21, 80, 110],
          backgroundColor: ['#42A5F5', '#FFD700', '#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#64B5F6', '#FFEB3B', '#FF6384', '#36A2EB', '#FFCE56']
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
          text: 'Total Supply'
        }
      }
    };
  
    this.lineChartOptions.series = [
      {
        name: "Incoming",
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        name: "Delivered",
        data: [28, 48, 40, 19, 86, 27, 90]
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
      text: "Supplies Delivered by Month",
      align: "left"
    };
  
    this.lineChartOptions.xaxis = {
      categories: ["January", "February", "March", "April", "May", "June", "July"],
    };
  
    this.lineChartOptions.yaxis = {
      title: {
        text: ""
      }
    };
  }
}