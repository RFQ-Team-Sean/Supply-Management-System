import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-inspection-dashboard',
  standalone: true,
  imports: [ChartModule, CardModule, ButtonModule, ScrollPanelModule],
  templateUrl: './inspection-dashboard.component.html',
  styleUrls: ['./inspection-dashboard.component.scss']
})
export class InspectionDashboardComponent implements OnInit {
  data: any;
  options: any;
  departmentData: any;
  departmentOptions: any;
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.data = {
      labels: ['Assets', 'Requests', 'Returns'],
      datasets: [
        {
          data: [65, 60, 28],
          backgroundColor: ['#42A5F5', '#ffd700', '#9CCC65'],
          hoverBackgroundColor: ['#64B5F6', '#FFEB3B', '#AED581']
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
          text: 'Inspection Dashboard'
        }
      }
    };

    this.departmentData = {
      labels: ['IT', 'HR', 'Finance', 'Marketing', 'Sales'],
      datasets: [
        {
          data: [120, 90, 75, 60, 45],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#FF7043'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#4DD0E1', '#FF8A65']
        }
      ]
    };

    this.departmentOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Assets per Department'
        }
      },
      scales: {
        y: {
          ticks: {
            stepSize: 20,
            callback: function(value: number) {
              return value;
            }
          },
          min: 0,
          max: 140
        }
      }
    };

    
  }
}