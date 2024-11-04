import { Component, CUSTOM_ELEMENTS_SCHEMA, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarServiceService } from '../../../core/services/SidebarService/sidebar-service.service';

interface MenuItem {
  label: string;
  icon?: string;
  route: string;  
  svgIcon?: string;
  children?: MenuItem[];  // Optional sub-menu items
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  @Output() collapsedChange = new EventEmitter<boolean>();
  isCollapsed: boolean = false;
  isDropdownOpen: { [key: string]: boolean } = {};  // Track dropdown state

  title: string = ''; // New title property

  AdminMenu: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'ic:sharp-dashboard',
      route: '/admin/dashboard',
    },
    {
      label: 'User Management',
      icon: 'ic:outline-school',
      route: '/admin/user-management',
    },
    { label: 'Activity Logs', 
      icon: 'ic:baseline-format-list-bulleted', 
      route: '/admin/a-activitylogs' 
    },
    {
      label: 'System Settings',
      icon: 'ic:baseline-settings',
      route: '',  // Empty route since it will have sub-items
      children: [
        {
          label: 'None',
          icon: 'ic:baseline-manage-accounts',
          route: '/admin/',
        },
        {
          label: 'None',
          icon: 'ic:baseline-business',
          route: '/admin/',
        },
        {
          label: 'None',
          icon: 'ic:baseline-category',
          route: '/admin/',
        },
      ]
    },
    {
      label: 'Reports',
      icon: 'ic:baseline-assessment',
      route: '/admin/a-reports',
    },
    {
      label: 'Notifications',
      icon: 'ic:baseline-list-alt',
      route: '/admin/a-notification',
    },
  ];

  DepartmentuserMenu: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'ic:sharp-dashboard',
      route: '/user/dashboard',
    },
    {
      label: 'PPMP Management',
      icon: 'ic:outline-school',
      route: '/user/u-ppmpmanagement',
    },
    { label: 'Purchase Request Management', 
      icon: 'ic:baseline-format-list-bulleted', 
      route: '/user/u-purchasemanagement' 
    },
    {
      label: 'Inventory Management',
      icon: 'ic:baseline-format-list-bulleted',
      route: '/user/u-inventorymanagement',
    },
    {
      label: 'Reports',
      icon: 'ic:baseline-list-alt',
      route: '/user/u-reports',
    },
    {
      label: 'Notifications',
      icon: 'ic:baseline-list-alt',
      route: '/user/u-notification',
    },
  ];

  GsoMenu: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'ic:sharp-dashboard',
      route: '/gso/dashboard',
    },
    { label: 'Purchase Request Management', 
      icon: 'ic:baseline-format-list-bulleted', 
      route: '/gso/u-purchasemanagement' 
    },
    {
      label: 'Inventory Management',
      icon: 'ic:baseline-format-list-bulleted',
      route: '/gso/gso-inventorymanagement',
    },
    {
      label: 'Reports',
      icon: 'ic:baseline-list-alt',
      route: '/gso/gso-reports',
    },
    {
      label: 'Notifications',
      icon: 'ic:baseline-list-alt',
      route: '/gso/gso-notifications',
    },
    {
      label: 'System Settings',
      icon: 'ic:baseline-settings',
      route: '',  // Empty route since it will have sub-items
      children: [
        {
          label: 'None',
          icon: 'ic:baseline-manage-accounts',
          route: '/admin/',
        },
        {
          label: 'None',
          icon: 'ic:baseline-business',
          route: '/admin/',
        },
        {
          label: 'None',
          icon: 'ic:baseline-category',
          route: '/admin/',
        },
      ]
    },
  ];

  generalMenu: MenuItem[] = [
    { label: 'Report a Problem', icon: 'ic:baseline-report-problem', route: '/report' },
    { label: 'Sign Out', icon: 'ic:outline-logout', route: '/login' },
  ];

  currentMenu: MenuItem[] = [];
  othersMenu: MenuItem[] = [];

  constructor(private router: Router, private sidebarService: SidebarServiceService) {}

  ngOnInit() {
    this.setMenuByRole();
    this.sidebarService.isCollapsed$.subscribe(
      isCollapsed => {
        this.isCollapsed = isCollapsed;
        this.collapsedChange.emit(this.isCollapsed);
      }
    );
  }

  toggleDropdown(label: string): void {
    this.isDropdownOpen[label] = !this.isDropdownOpen[label];
  }

  setMenuByRole() {
    const userRole = localStorage.getItem('userRole') as 'user' | 'admin' | 'gso';
    console.log('User Role:', userRole);
    switch (userRole) {
      case 'user':
        this.currentMenu = [...this.DepartmentuserMenu];
        this.title = 'Department Staff Portal'; // Set title for user menu
        break;
      case 'admin':
        this.currentMenu = [...this.AdminMenu];
        this.title = 'Administrator Portal'; 
        break;
      case 'gso':
        this.currentMenu = [...this.AdminMenu];
        this.title = 'GSO Portal'; 
        break;     
      default:
        console.error('Invalid role');
        this.router.navigate(['/login']);
    }
    this.othersMenu = [...this.generalMenu];
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  signOut() {
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  getMenuItemClasses(): string {
    return `flex items-center py-3 px-4 rounded-lg cursor-pointer transition-colors duration-200 glassmorph group ${this.isCollapsed ? 'justify-center' : ''}`;
  }

  getTextClasses(): string {
    return this.isCollapsed ? 'hidden sidebar-hover-text' : 'block sidebar-text';
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}
