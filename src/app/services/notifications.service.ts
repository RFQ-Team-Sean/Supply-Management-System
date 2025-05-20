// src/app/services/notification.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Basic shape of a notification, possibly targeted to a specific user via `toUserId`. */
export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read?: boolean;
  toUserId?: string; // If set, only that user sees it
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly NOTIFICATIONS_KEY = 'notifications_data';

  // We store notifications in a BehaviorSubject so components can subscribe
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    // 1) Load from localStorage on service init
    const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (stored) {
      try {
        const parsed: AppNotification[] = JSON.parse(stored);
        // Convert string timestamps back to Date objects
        // (assuming we want them as Date)
        for (const notif of parsed) {
          if (typeof notif.timestamp === 'string') {
            notif.timestamp = new Date(notif.timestamp);
          }
        }
        this.notificationsSubject.next(parsed);
      } catch (error) {
        console.error('Error parsing stored notifications', error);
        // fallback to empty
      }
    }

    // 2) Whenever notifications change, save to localStorage
    this.notifications$.subscribe(list => {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(list));
    });
  }

  /**
   * Add a new notification.
   * @param message The message text.
   * @param type The notification type (info, success, warning, error).
   * @param toUserId If provided, only that user sees it (in NotificationComponent).
   */
  addNotification(
    message: string,
    type: AppNotification['type'] = 'info',
    toUserId?: string
  ): void {
    console.log(`NOTIFICATION_SERVICE: Adding notification: "${message}" (type: ${type}, target: ${toUserId || 'all users'})`);
    
    try {
      const newNotif: AppNotification = {
        id: this.generateId(),
        message,
        type,
        timestamp: new Date(),
        toUserId
      };
      
      console.log(`NOTIFICATION_SERVICE: Created notification object:`, JSON.stringify(newNotif));
      
      // push into BehaviorSubject array
      const currentList = this.notificationsSubject.value;
      console.log(`NOTIFICATION_SERVICE: Current notification count: ${currentList.length}`);
      
      // Use a completely fresh array to avoid any reference issues
      const updatedList = [...currentList, newNotif];
      
      this.notificationsSubject.next(updatedList);
      console.log(`NOTIFICATION_SERVICE: New notification count: ${this.notificationsSubject.value.length}`);
      
      // Force save to localStorage directly as backup
      const jsonToSave = JSON.stringify(updatedList);
      localStorage.setItem(this.NOTIFICATIONS_KEY, jsonToSave);
      console.log(`NOTIFICATION_SERVICE: Directly saved to localStorage, size: ${jsonToSave.length} bytes`);
      
      // Manually verify localStorage update
      setTimeout(() => {
        const storedJson = localStorage.getItem(this.NOTIFICATIONS_KEY);
        const parsedList = storedJson ? JSON.parse(storedJson) : [];
        console.log(`NOTIFICATION_SERVICE: Verified ${parsedList.length} notifications in localStorage`);
        
        // Print all notifications to ensure they're saved correctly
        if (parsedList.length > 0) {
          console.log(`NOTIFICATION_SERVICE: All current notifications:`, 
            parsedList.map((n: any) => ({ 
              message: n.message,
              type: n.type,
              toUserId: n.toUserId || 'all'
            }))
          );
        }
      }, 100);
    } catch (error) {
      console.error('NOTIFICATION_SERVICE: Error adding notification:', error);
    }
  }

  /** Remove a notification by ID (e.g., when user clicks). */
  removeNotification(id: string) {
    const updated = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
  }
  markAsRead(id: string) {
    const notifIndex = this.notificationsSubject.value.findIndex(n => n.id == id);
    const notifs = this.notificationsSubject.value;
    notifs[notifIndex].read = true;
    this.notificationsSubject.next(notifs);
  }

  /** Clear all notifications. */
  clearAll() {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    // Generate a simple 8-char hex ID
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}
