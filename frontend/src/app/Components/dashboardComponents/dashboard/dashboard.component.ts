import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [RouterOutlet, RouterLink],
})
export class DashboardComponent implements OnInit {
  constructor() {}

  activeMenu: string = 'users';
  dropdownStates: { [key: string]: boolean } = {};

  toggleDropdown(menu: string): void {
    this.dropdownStates[menu] = !this.dropdownStates[menu];
  }

  isDropdownOpen(menu: string): boolean {
    return this.dropdownStates[menu];
  }


  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  
  ngOnInit(): void {
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
}