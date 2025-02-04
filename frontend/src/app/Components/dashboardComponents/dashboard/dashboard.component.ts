import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [RouterOutlet, RouterLink]
})
export class DashboardComponent {
  isSidebarHidden = false;
  activeMenu: string = 'users';
  dropdownStates: { [key: string]: boolean } = {};

  constructor() {}

  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  toggleDropdown(menu: string): void {
    this.dropdownStates[menu] = !this.dropdownStates[menu];
  }

  isDropdownOpen(menu: string): boolean {
    return this.dropdownStates[menu];
  }
}