// dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { 
  Users, Package, Activity, AlertCircle 
} from 'lucide-angular';

interface StatCard {
  title: string;
  value: string;
  icon: any;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
}

interface ActivityItem {
  title: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    LucideAngularModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  welcomeMessage = signal('Welcome Admin!');
  description = signal('Manage your procurement, inventory, and property records efficiently.');
  
  statCards = signal<StatCard[]>([
    { title: 'Total Users', value: '2,543', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Items', value: '1,234', icon: Package, color: 'bg-green-500' },
    { title: 'Daily Activities', value: '145', icon: Activity, color: 'bg-purple-500' },
    { title: 'Pending Alerts', value: '5', icon: AlertCircle, color: 'bg-orange-500' }
  ]);

  chartData = signal<ChartData[]>([
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 }
  ]);

  recentActivities = signal<ActivityItem[]>([
    { title: 'New inventory item added', time: '2 hours ago', status: 'success' },
    { title: 'Monthly report generated', time: '4 hours ago', status: 'success' },
    { title: 'Low stock alert', time: '6 hours ago', status: 'warning' }
  ]);

  ngOnInit() {
    // Initialize any additional data or subscriptions here
  }
}