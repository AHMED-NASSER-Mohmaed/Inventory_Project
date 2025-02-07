import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../../../_models/user';
import { CustomersService } from '../../../_services/customers.service';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule],
  templateUrl: './sellers.component.html',
  styleUrl: './sellers.component.css'
})
export class SellersComponent {
  constructor(private customerService: CustomersService, public dialog: MatDialog) { }
  dropdownStates: boolean[] = [];
  sub: Subscription = {} as Subscription;
  sub2: Subscription = {} as Subscription;
  sub3: Subscription = {} as Subscription;
  users: User[] = [];
  paginatedUsers: User[] = [];
  isDarkMode: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  ngOnInit(): void {
    this.fetchSellers();
  }

  fetchSellers(): void {
    this.sub = this.customerService.getPaginatedSellers(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.users = res.users;
        this.totalPages = res.totalPages;
        this.dropdownStates = new Array(this.users.length).fill(false);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchSellers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchSellers();
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  openConfirmDialog(userId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    this.sub3 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(userId);
      }
    });
  }

  deleteUser(id: string): void {
    this.sub2 = this.customerService.deleteCustomer(id).subscribe({
      next: (res) => {
        console.log(res);
        this.users = this.users.filter((user) => user._id !== id);
        this.fetchSellers();
        console.log(this.users);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete');
      }
    });
  }

  toggleDropdown(index: number): void {
    this.dropdownStates[index] = !this.dropdownStates[index];
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.sub2) {
      this.sub.unsubscribe();
    }

    if (this.sub3) {
      this.sub.unsubscribe();
    }
  }
}