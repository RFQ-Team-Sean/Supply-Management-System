import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SideBarComponent } from '../../shared/components/side-bar/side-bar.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { SidebarServiceService } from '../../core/services/SidebarService/sidebar-service.service';

@Component({
  selector: 'app-gso-layout',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    CommonModule,
    SideBarComponent,
  ],
  templateUrl: './gso-layout.component.html',
  styleUrl: './gso-layout.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class GsoLayoutComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  notification: boolean = false;
  settings: boolean = false;
  success: boolean = false;
  noChanges: boolean = false;
  isSidebarCollapsed = false;
  isChatVisible: boolean = false;

  constructor(
    private sidebarService: SidebarServiceService
  ) {}

  ngOnInit() {
    
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(
        collapsed => this.isSidebarCollapsed = collapsed
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  toggleChatModal() {
    this.isChatVisible = !this.isChatVisible;
  }
}