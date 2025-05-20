import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { LottieAnimationComponent } from '../ui-components/lottie-animation/lottie-animation.component';
import {  StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-dashboard',
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, FormsModule, NgApexchartsModule, MaterialModule, ButtonModule, DividerModule, TableModule, LottieAnimationComponent, StyleClassModule]
})
export class StarterComponent implements OnInit {
  today = new Date().getDate();
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: number[] = [];
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  showAnimation: boolean = false;

  isToday(day: number): boolean {
    return (
      day === this.today &&
      this.currentMonth === new Date().getMonth() &&
      this.currentYear === new Date().getFullYear()
    );
  }

  quotes: string[] = [
    `"Do what you can, with what you have, where you are." — Theodore Roosevelt`,
    `"It always seems impossible until it’s done." — Nelson Mandela`,
    `"The only way to do great work is to love what you do." — Steve Jobs`,
    `"Believe you can and you're halfway there." — Theodore Roosevelt`,
    `"Wash your own dishes afterwards!!!" — Sean Palacay`,
    `"If the world was ending, I wanna  be next to you." — Atty. Jeremiah Macalla`,
  ];
  currentQuote: string = this.quotes[0];

  ngOnInit() {
    this.generateCalendar();
    this.filterEventsByMonth();
    this.checkEvents();

    setInterval(() => {
      this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }, 3000);
  }

  checkEvents() {
    this.showAnimation = this.filteredEvents.length === 0; // Show Lottie if no events exist
  }

  ppmpData = [
    { projectName: 'Network Upgrade', department: 'IT', year: 2024, budget: 150000, status: 'Pending' },
    { projectName: 'Financial Audit', department: 'Finance', year: 2024, budget: 200000, status: 'Pending' },
    { projectName: 'Employee Training', department: 'HR', year: 2024, budget: 50000, status: 'Pending' },
    { projectName: 'Warehouse Expansion', department: 'Logistics', year: 2024, budget: 120000, status: 'Pending' },
    { projectName: 'Marketing Campaign', department: 'Marketing', year: 2024, budget: 80000, status: 'Pending' },
    { projectName: 'Financial Audit', department: 'Finance', year: 2024, budget: 200000, status: 'Pending' },
  ];

  // Events
  events = [
    { title: 'Inspection Review', date: new Date(2025, 0, 5) },
    { title: 'Supply Order Submission', date: new Date(2025, 0, 10) },
    { title: 'Purchase Requests Approval', date: new Date(2025, 0, 15) },
    { title: 'Inventory Audit', date: new Date(2025, 0, 20) }
  ];

  filteredEvents: any[] = [];

  // Budget Allocation Chart
  public budgetChartOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  } = {
    series: [
      { name: "Total Budget", data: [20000, 15000, 25000, 18000, 22000] },
      { name: "Allocated", data: [15000, 8000, 20000, 12000, 16000] },
      { name: "Remaining", data: [5000, 7000, 5000, 6000, 6000] }
    ],
    chart: { type: "line", height: 330 },
    xaxis: { categories: ["IT", "HR", "Finance", "Marketing", "Logistics"] },
    yaxis: { title: { text: "Budget ($)" } },
    stroke: { curve: "smooth" },
    title: { text: "Budget Allocation Overview", align: "left" }
  };

  // Supply Monitoring Chart
  public supplyChartOptions = {
    series: [
      { name: 'Stock Available', data: [50, 100, 40, 30, 25] },
      { name: 'Stock Used', data: [30, 60, 20, 15, 10] }
    ],
    chart: { type: "bar" as ApexChart["type"], height: 330 },
    xaxis: { categories: ['Laptops', 'Office Chairs', 'Whiteboards', 'Printers', 'Projectors'] } as ApexXAxis,
    yaxis: { title: { text: 'Stock Quantity' } } as ApexYAxis,
    stroke: { curve: "smooth" as ApexStroke["curve"] },
    title: { text: 'Supply Monitoring', align: "left" as ApexTitleSubtitle["align"] }
  };

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    this.calendarDays = new Array(firstDay).fill(0).concat([...Array(totalDays).keys()].map(d => d + 1));
  }

  changeMonth(direction: number) {
    this.currentMonth += direction;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
    this.filterEventsByMonth();
  }

  isEventDate(day: number): boolean {
    return this.events.some(event => 
      event.date.getFullYear() === this.currentYear &&
      event.date.getMonth() === this.currentMonth &&
      event.date.getDate() === day
    );
  }

  filterEventsByMonth() {
    this.filteredEvents = this.events.filter(event => 
      event.date.getFullYear() === this.currentYear &&
      event.date.getMonth() === this.currentMonth
    );
    this.checkEvents();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
}
