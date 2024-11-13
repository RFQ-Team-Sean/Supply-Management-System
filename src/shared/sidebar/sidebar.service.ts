import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SidebarItem } from './sidebar.interface';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarItems: SidebarItem[] = [
    { icon: 'layout-dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'users', label: 'User Management', route: '/users' },
    { icon: 'activity', label: 'Activity Logs', route: '/logs' },
    { icon: 'settings', label: 'System Settings', route: '/settings' },
    { icon: 'file-text', label: 'Reports', route: '/reports' },
    { icon: 'bell', label: 'Notifications', route: '/notifications' },
    { icon: 'alert-triangle', label: 'Report a Problem', route: '/report-problem' }
  ];

  private currentRoute = new BehaviorSubject<string>('/dashboard');
  currentRoute$ = this.currentRoute.asObservable();

  getSidebarItems(): SidebarItem[] {
    return this.sidebarItems;
  }

  setCurrentRoute(route: string) {
    this.currentRoute.next(route);
  }
}