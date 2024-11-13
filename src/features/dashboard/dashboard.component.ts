// dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../shared/calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  welcomeMessage = 'Welcome Admin!';
  description = 'This is the Supply Management System of the admin where you can manage procurement, inventory, and property records.';
}