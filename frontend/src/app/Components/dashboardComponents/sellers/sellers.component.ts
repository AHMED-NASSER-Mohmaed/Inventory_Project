import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../../../_models/user';
import { CustomersService } from '../../../_services/customers.service';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { SellerinfodialogComponent } from '../../sellerinfodialog/sellerinfodialog.component';

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
  selectedUser: User | null = null;
  editing: boolean = false;

  ngOnInit(): void {
    this.fetchSellers();
  }

  fetchSellers(): void {
    if (this.userCache[this.currentPage]) {
      this.users = this.userCache[this.currentPage];
      this.updatePaginationState();
    } else {
      this.sub = this.customerService.getPaginatedSellers(this.currentPage, this.itemsPerPage).subscribe({
        next: (res) => {
          this.users = res.data.result;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = !!res.data.previous;
          this.dropdownStates = new Array(this.users.length).fill(false);
          this.userCache[this.currentPage] = this.users;
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

  openConfirmDialog2(SSN: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    this.sub3 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activateSeller(SSN);
      }
    });
  }

  showSellerInfo(user: User): void {
    this.selectedUser = {
      ...user,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    };
  }

  deActiveSeller(SSN: string): void {
    this.sub2 = this.customerService.deActiveSeller(SSN).subscribe({
      next: (res) => {
        console.log(res);
        this.updateUserStatus(SSN, false);
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
    this.sub4 = this.customerService.activateSeller2(SSN).subscribe({
      next: (res) => {
        console.log(res);
        this.updateUserStatus(SSN, true);
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

  updateUserStatus(SSN: string, isActive: boolean): void {
    const user = this.users.find(u => u.SSN === SSN);
    if (user) {
      user.isActive = isActive;
    }
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  toggleEdit(event?: any): void {
    if (this.editing) {
      if (this.selectedUser) {
        const index = this.users.findIndex(u => u.SSN === this.selectedUser!.SSN);
        if (index !== -1) {
          this.users[index] = { ...this.selectedUser };
        }
      }
      this.editing = false;
    } else {
      this.editing = true;
    }
    if (event && event.target) event.target.blur();
  }

  triggerImageUploadSeller(): void {
    document.getElementById('imageUploadSeller')?.click();
  }

  async onImageChangeSeller(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file && this.selectedUser) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedUser!.photo.url = e.target.result;
      };
      reader.readAsDataURL(file);
      try {
        const response = await this.customerService.changeImage(this.selectedUser._id, file).toPromise();
        console.log('Image updated successfully', response);
      } catch (error) {
        console.error('Error updating image', error);
      }
    }
  }

  updateSellerImage(id: string, file: File): void {
    this.customerService.changeImage(id, file).subscribe({
      next: (res) => {
        console.log('Image updated successfully', res);
      },
      error: (err) => {
        console.error('Error updating image', err);
      }
    });
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