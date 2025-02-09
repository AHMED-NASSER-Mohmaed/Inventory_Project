import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class SellersComponent implements OnInit, OnDestroy {
  constructor(private customerService: CustomersService, public dialog: MatDialog) { }
  dropdownStates: boolean[] = [];
  sub: Subscription = {} as Subscription;
  sub2: Subscription = {} as Subscription;
  sub3: Subscription = {} as Subscription;
  sub4: Subscription = {} as Subscription;
  users: User[] = [];
  paginatedUsers: User[] = [];
  isDarkMode: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  userCache: { [page: number]: User[] } = {};
  total: number = 0;

  ngOnInit(): void {
    this.fetchSellers();
  }

  fetchSellers(): void {
    if (this.userCache[this.currentPage]) {
      // Load from cache
      this.users = this.userCache[this.currentPage];
      this.updatePaginationState();
    } else {
      // Fetch from server
      this.sub = this.customerService.getPaginatedSellers(this.currentPage, this.itemsPerPage).subscribe({
        next: (res) => {
          this.users = res.data.result;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = !!res.data.previous;
          this.dropdownStates = new Array(this.users.length).fill(false);
          this.userCache[this.currentPage] = this.users; // Cache the result
          this.updatePaginationState();
          this.total = res.data.total - 1;
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
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
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

  openConfirmDialog(SSN: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    this.sub3 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deActiveSeller(SSN);
      }
    });
  }

  deActiveSeller(SSN: string): void {
    this.sub2 = this.customerService.deActiveSeller(SSN).subscribe({
      next: (res) => {
        console.log(res);
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

  activateSeller(SSN: string): void {
    console.log(this.customerService.token)
    this.sub4 = this.customerService.activateSeller(SSN).subscribe({
      next: (res) => {
        console.log(res);
        this.fetchSellers();
        console.log(this.users);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete');
      }
    })
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

    if (this.sub4) {
      this.sub.unsubscribe();
    }
  }
}