import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { User, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [TranslateModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
})
export class AppNavItemComponent implements OnChanges, OnInit {
  @Output() toggleMobileLink: any = new EventEmitter<void>();
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

  //@HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: NavItem | any;
  @Input() depth: any;

  user?:User;

  constructor(public navService: NavService, public router: Router, private userService:UserService) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }
  
  ngOnInit(): void {
     this.user = this.userService.getUser();
  }

  ngOnChanges() {
    this.navService.currentUrl.subscribe((url: string) => {});
  }

  onItemSelected(item: NavItem) {
    this.router.navigate([item.route]);

    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  onSubItemSelected(item: NavItem) {
    
  }
}
