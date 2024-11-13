// sidebar.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  LayoutDashboard, Users, Activity, Settings, FileText, 
  Bell, AlertTriangle, LogOut 
} from 'lucide-angular';

interface SidebarItem {
  icon: any;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  sidebarItems = signal<SidebarItem[]>([]);
  currentRoute = signal<string>('');
  userProfile = signal({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'A'
  });

  constructor(private router: Router) {
    this.initializeSidebarItems();
  }

  ngOnInit() {
    this.currentRoute.set(this.router.url);
  }

  private initializeSidebarItems() {
    this.sidebarItems.set([
      { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
      { icon: Users, label: 'Users', route: '/users' },
      { icon: Activity, label: 'Activities', route: '/activities' },
      { icon: FileText, label: 'Reports', route: '/reports' },
      { icon: Bell, label: 'Notifications', route: '/notifications' },
      { icon: AlertTriangle, label: 'Alerts', route: '/alerts' },
      { icon: Settings, label: 'Settings', route: '/settings' }
    ]);
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute() === route;
  }

  navigate(route: string) {
    this.currentRoute.set(route);
    this.router.navigate([route]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}