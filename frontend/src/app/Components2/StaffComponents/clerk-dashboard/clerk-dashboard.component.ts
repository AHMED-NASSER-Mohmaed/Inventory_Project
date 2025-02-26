import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../_services/account.service';
import { ConfirmLogoutDialogComponent } from '../../../confirm-logout-dialog/confirm-logout-dialog.component';
import { decodeToken } from '../../../_helper/jwt-helper';



@Component({
  selector: 'app-clerk-dashboard',
  imports: [RouterOutlet, RouterLink , RouterModule],
  templateUrl: './clerk-dashboard.component.html',
  styleUrl: './clerk-dashboard.component.css'
})
export class ClerkDashboardComponent implements OnInit, OnDestroy  {
dropdownStates: { [key: string]: boolean } = {};
  sub = {} as Subscription;
  tokenData: any = null;

  constructor(public accountService: AccountService, public dialog: MatDialog, public router: Router) {}

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
  
  ngOnInit(): void {


    // this.loadPendingOrders();



    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
      console.log('Decoded token:', this.tokenData);
    }

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

    // TOGGLE SIDEBAR
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
    
  }


  // loadPendingOrders() {
  //   // Logic to fetch the pending orders or ensure the pending orders component is loaded
  //   this.router.navigate(['/clerk-dashboard/pending-orders']); // Adjust the route as per your app's routing
  // }

  ngOnDestroy(): void {
    // if(this.sub){
    //   this.sub.unsubscribe();
    // }
  }
}
