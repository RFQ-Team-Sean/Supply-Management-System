// src/app/components/notification/notification.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, AppNotification } from 'src/app/services/notifications.service';
import { UserService, User } from 'src/app/services/user.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 flex flex-col gap-2 z-50">
      <div
        *ngFor="let notif of filteredNotifications"
        (click)="remove(notif.id)"
        class="cursor-pointer text-white px-4 py-2 rounded shadow"
        [ngClass]="notif.type"
      >
        {{ notif.message }}
      </div>
    </div>
  `,
  styles: [`
    .info { background-color: #0284c7; }
    .success { background-color: #16a34a; }
    .warning { background-color: #f59e0b; }
    .error { background-color: #dc2626; }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {

  filteredNotifications: AppNotification[] = [];
  private sub!: Subscription;

  currentUser?: User;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService // so we can get the current user
  ) {}

  ngOnInit() {
    // Get the logged-in user
    this.currentUser = this.userService.getUser();

    // Subscribe to all notifications
    this.sub = this.notificationService.notifications$.subscribe(list => {
      this.filteredNotifications = list.filter(n => {
        // If no toUserId, show to everyone
        if (!n.toUserId) {
          return true; // visible to all (system-wide notifications)
        }
        
        // Otherwise, check if this notification is targeted to the current user
        // Check against username, fullname, and ID to be more flexible
        return (n.toUserId === this.currentUser?.id) || 
               (n.toUserId === this.currentUser?.username) ||
               (n.toUserId === this.currentUser?.fullname);
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  remove(id: string) {
    this.notificationService.removeNotification(id);
  }
}
