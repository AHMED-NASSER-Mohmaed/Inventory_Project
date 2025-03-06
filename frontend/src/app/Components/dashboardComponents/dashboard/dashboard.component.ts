import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AccountService } from '../../../_services/account.service';
import { ConfirmLogoutDialogComponent } from '../../../confirm-logout-dialog/confirm-logout-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { RouterModule } from '@angular/router';
import { SuperAdminFashboardService } from '../../../_services/super-admin-fashboard.service';
import { CommonModule } from '@angular/common';

interface Notification {
  _id: string;
  product: {
    name: string;
    code: string;
  };
  branch: {
    governate: number;
    location: string;
  };
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [RouterOutlet, RouterLink, RouterModule, CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dropdownStates: { [key: string]: boolean } = {};
  sub = {} as Subscription;
  tokenData: any = null;
  notifications: Notification[] = [];
  isNotificationsOpen: boolean = false;
  notificationsCount: number = 0;
  selectedNotification: Notification | null = null;
  isNotificationsClosing: boolean = false;
  isModalClosing: boolean = false;

  constructor(
    public accountService: AccountService, 
    public dialog: MatDialog, 
    public router: Router, 
    private superAdminDashboardService: SuperAdminFashboardService
  ) {}

  toggleDropdown(menu: string): void {
    this.dropdownStates[menu] = !this.dropdownStates[menu];
  }

  isDropdownOpen(menu: string): boolean {
    return this.dropdownStates[menu];
  }

  openConfirmDialog(){
    const dialogRef = this.dialog.open(ConfirmLogoutDialogComponent);
    this.sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigateByUrl('/login');
        this.accountService.logout();
      } else {
        console.log('User canceled logout');
      }
    });
  }

  toggleNotifications() {
    if (this.isNotificationsOpen) {
      this.closeNotifications();
    } else {
      this.isNotificationsOpen = true;
      this.loadNotifications();
    }
  }

  closeNotifications() {
    this.isNotificationsClosing = true;
    setTimeout(() => {
      this.isNotificationsOpen = false;
      this.isNotificationsClosing = false;
    }, 280); 
  }

  onDocumentClick(event: MouseEvent) {
    const notificationContainer = document.querySelector('.notification-container');
    const modalOverlay = document.querySelector('.notification-modal-overlay');
    
    if (notificationContainer && !notificationContainer.contains(event.target as Node) && 
        this.isNotificationsOpen && !modalOverlay) {
      this.closeNotifications();
    }
  }

  loadNotifications() {
    this.superAdminDashboardService.getNotifications().subscribe({
      next: (response) => {
        if (response.message === 'success' && response.data) {
          this.notifications = response.data;
          this.updateNotificationsCount();
        }
      },
      error: (error) => {
        console.error('Failed to load notifications', error);
      }
    });
  }

  updateNotificationsCount() {
    this.notificationsCount = this.notifications.filter(n => n.status === 'notseen').length;
  }

  markAsSeen(notification: Notification, event: Event) {
    event.stopPropagation();
    
    this.selectedNotification = notification;
    
    if (notification.status === 'notseen') {
      this.superAdminDashboardService.markNotificationAsSeen(notification._id).subscribe({
        next: () => {
          notification.status = 'seen';
          this.updateNotificationsCount();
        },
        error: (error) => {
          console.error('Failed to mark notification as seen', error);
        }
      });
    }
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    
    this.superAdminDashboardService.deleteNotification(notification._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n._id !== notification._id);
        this.updateNotificationsCount();
      },
      error: (error) => {
        console.error('Failed to delete notification', error);
      }
    });
  }

  closeDetailsModal() {
    this.isModalClosing = true;
    setTimeout(() => {
      this.selectedNotification = null;
      this.isModalClosing = false;
    }, 280);
  }
  
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
      console.log('Decoded token:', this.tokenData);
    }

    this.loadNotifications();

    const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

    allSideMenu.forEach(item => {
      const li = item.parentElement;

      item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
          i.parentElement?.classList.remove('active');
        })
        li?.classList.add('active');
      })
    });

    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (menuBar && sidebar) {
      menuBar.addEventListener('click', function () {
        sidebar.classList.toggle('hide');
      });
    }

    const searchButton = document.querySelector('#content nav form .form-input button');
    const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
    const searchForm = document.querySelector('#content nav form');

    if (searchButton && searchButtonIcon && searchForm) {
      searchButton.addEventListener('click', function (e) {
        if (window.innerWidth < 576) {
          e.preventDefault();
          searchForm.classList.toggle('show');
          if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
          } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
          }
        }
      });
    }

    if (window.innerWidth < 768) {
      if (sidebar) {
        sidebar.classList.add('hide');
      }
    } else if (window.innerWidth > 576) {
      if (searchButtonIcon && searchForm) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
      }
    }

    window.addEventListener('resize', function () {
      if (this.innerWidth > 576) {
        if (searchButtonIcon && searchForm) {
          searchButtonIcon.classList.replace('bx-x', 'bx-search');
          searchForm.classList.remove('show');
        }
      }
    });

    const switchMode = document.getElementById('switch-mode') as HTMLInputElement;

    if (switchMode) {
      const parentDiv = document.querySelector('.parent3');
      switchMode.addEventListener('change', function (this: HTMLInputElement) {
        if (this.checked) {
          parentDiv?.classList.add('dark');
        } else {
          parentDiv?.classList.remove('dark');
        }
      });
    }
    
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    if(this.sub){
      this.sub.unsubscribe();
    }
    
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
}