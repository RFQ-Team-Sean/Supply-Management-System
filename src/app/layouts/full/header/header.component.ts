import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { User, UserService } from 'src/app/services/user.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { BreadcrumbService } from 'src/app/services/breadcrump.service';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { filter, Subscription } from 'rxjs';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { CrudService } from 'src/app/services/crud.service';
import { Notification } from 'src/app/schema/schema';
import { environment } from 'src/environment/environment';
import { NotificationService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgScrollbarModule, MaterialModule, MatButtonModule, BadgeModule,OverlayBadgeModule,IconFieldModule, InputIconModule,InputTextModule,
    BreadcrumbModule,ConfirmDialogModule, DividerModule,PanelModule,ScrollPanelModule, ToastModule, AutoCompleteModule, FormsModule,
  ],
  templateUrl: './header.component.html',
  providers:[ConfirmationService,MessageService],
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  items:MenuItem[];
  user?:User;

  environment = environment
  intervalId: any;
  currentTime: Date = new Date();
  greeting: string;
  notification$:Subscription;
  notifications:Notification[]=[];

  suggestions:{value:string, location:string}[]=[{value:'REC0012348',location:'Delivery Receipts'},
    {value:'REC0012350',location:'Delivery Receipts'},
    {value:'REC0012351',location:'Delivery Receipts'},
    {value:'Office Essentials Ltd.',location:'Offices'},
    {value:'Main Warehouse.',location:'Inventory Location'},
    {value:'DV-2025-321902',location:'Disbursement Voucher'},
    {value:'Asset',location:'Industrial Printer'},]
  filteredSuggestions:{value:string, location:string}[]=[];
  searchValue:string='';

  constructor(private userService:UserService, 
    private router:Router,
    private utilService: UtilsService,
    private activatedRoute:ActivatedRoute,
    private crudService:CrudService,
    private breadcrumpService:BreadcrumbService,
    private confirmationService:ConfirmationService,
    private notificationService: NotificationService) {}

  search(event: AutoCompleteCompleteEvent) {
      this.filteredSuggestions = this.suggestions.filter((a)=>a.value.includes(event.query)) ;
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) {
      return 'Good Morning 🌞';
    } else if (hour < 18) {
      return 'Good Afternoon 🌞';
    } else {
      return 'Good Evening 🌙';
    }
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.greeting = this.getGreeting();
    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
    }, 60000);  // 60000 milliseconds = 1 minute
    this.items = [
      { icon: 'pi pi-home', route: '/' },
      ...this.breadcrumpService.createBreadcrumbs(this.activatedRoute.root)];
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.items = [
          { icon: 'pi pi-home', route: '/' },
          ...this.breadcrumpService.createBreadcrumbs(this.activatedRoute.root)];
      });
    this.loadNotifications();
    this.notification$ = this.crudService.live(Notification).subscribe(()=>{
      this.loadNotifications();
    })
  }

  ngOnDestroy(): void {
    if(this.notification$){
      this.notification$.unsubscribe();
    }
  }


  async loadNotifications(){
    console.log("Loading notifications...");
    
    // Get notifications from the CRUD service
    this.notifications = await this.crudService.getAll(Notification);
    console.log(`Loaded ${this.notifications.length} notifications from CRUD service`);
    
    // Re-enable filtering, but do it correctly for both CRUD and localStorage notifications
    // Filter CRUD notifications by office, role, user ID
    this.notifications = this.notifications.filter(n=>
      ((n.office_id == this.user?.officeId) || !n.office_id) &&
      ((n.role == this.user?.role) || !n.role) &&
      ((n.user_id == this.user?.id) || !n.user_id)
    );
    console.log(`After filtering CRUD notifications, have ${this.notifications.length} notifications`);
    
    // IMPORTANT: Also get notifications from the NotificationService
    if (this.notificationService) {
      try {
        // Get local notifications from notification service (localStorage)
        const localNotifications = await this.getLocalNotifications();
        console.log(`Loaded ${localNotifications.length} notifications from localStorage`);
        
        // For debug purposes, log all stored notifications
        if (localNotifications.length > 0) {
          console.log('Local notifications:', localNotifications.map(n => ({
            message: n.message,
            type: n.type,
            toUserId: n.toUserId
          })));
        }
        
        // Filter notifications to only show those applicable to the current user
        // A notification is relevant if:
        // 1. It has no toUserId (global notification)
        // 2. Its toUserId matches current user's username or fullname
        const currentUsername = this.user?.username || '';
        const currentFullname = this.user?.fullname || '';
        
        const userRelatedNotifications = localNotifications.filter(n => 
          !n.toUserId || // No target user (visible to all)
          n.toUserId === currentUsername || // Matches username
          n.toUserId === currentFullname    // Matches fullname
        );
        
        console.log(`Filtering notifications for user: ${currentUsername}/${currentFullname}`);
        console.log(`Before user filtering: ${localNotifications.length}, after: ${userRelatedNotifications.length}`);
        console.log('All notifications before filtering:', localNotifications.map(n => ({
          message: n.message,
          type: n.type, 
          toUserId: n.toUserId || 'all users'
        })));
        
        // Convert to compatible format and cast to Notification type
        const formattedLocalNotifications = userRelatedNotifications.map(n => {
          // Create object with necessary properties
          const notificationObj = {
            id: n.id,
            message: n.message,
            type: n.type,
            timestamp: n.timestamp,
            is_read: n.read || false,
            user_id: n.toUserId,
            // Add required properties for Notification type
            created_at: n.timestamp,
            updated_at: n.timestamp,
            office_id: undefined, // Use undefined instead of null for string | undefined
            role: undefined // Use undefined instead of null
          };
          
          // Use type assertion with unknown first to avoid type errors
          return notificationObj as unknown as Notification;
        });
        
        console.log(`After formatting, have ${formattedLocalNotifications.length} local notifications`);
        
        // Add local notifications to the list
        this.notifications = [...this.notifications, ...formattedLocalNotifications];
        console.log(`Total notifications after merging: ${this.notifications.length}`);
      } catch (error) {
        console.error('Error loading local notifications:', error);
      }
    }
    
    // Reverse to show newest first
    this.notifications = this.notifications.reverse();
  }

  // Helper method to get local notifications as a Promise
  private getLocalNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      // Get notifications from localStorage directly as fallback
      try {
        const storedNotifications = localStorage.getItem('notifications_data');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          resolve(parsedNotifications);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Error getting local notifications:', error);
        resolve([]);
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile']); // Navigate to /profile
  }

  confirmLogout(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure that you want to logout?',
        header: 'Account Logout',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptButtonProps: {
            severity:'danger',
            label: 'Logout',
        },
        accept: () => {
            this.logout();
        },
        reject: () => {
            
        },
    });
  }

  getUnreadCount():number{
    return this.notifications.filter(notif=>!notif.is_read).length
  }

  async markNotificationsAsRead(){ 
    await this.crudService.partial_update_multiple(Notification,{
      'is_read': true,
    },{
      'is_read': false,
      'user_id': this.user?.id
    })
  }

  isDarkModeEnabled(){
    return this.utilService.isDarkModeEnabled();
  }

  toggleDarkMode(){
    this.utilService.toggleDarkMode();
  } 

  logout(){
    this.userService.logout();
    this.crudService.endLiveSessions();
  }

  clearCache(): void {
    localStorage.clear() // Clears local storage
    sessionStorage.clear() // Clears session storage
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name)) // Clears browser cache
    })
    window.location.reload() // Optionally reload the app
  }

}
