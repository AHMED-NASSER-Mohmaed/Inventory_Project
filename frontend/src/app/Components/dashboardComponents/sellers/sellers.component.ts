import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../../../_models/user';
import { CustomersService } from '../../../_services/customers.service';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { ConfirmDialogImgchangeComponent } from '../../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule , MatButtonToggleModule],
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.css' , './sellers.component.scss']
})

export class SellersComponent implements OnInit, OnDestroy {
  constructor(private customerService: CustomersService, public dialog: MatDialog) { }
  dropdownStates: boolean[] = [];
  sub: Subscription = {} as Subscription;
  sub2: Subscription = {} as Subscription;
  sub3: Subscription = {} as Subscription;
  sub4: Subscription = {} as Subscription;
  sub5: Subscription = {} as Subscription;
  sub6: Subscription = {} as Subscription;
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
  selectedUser: User = {} as User;
  backupUser: User = {} as User; // <-- new backup property
  editing: boolean = false;  // for input fields

  ngOnInit(): void {
    this.fetchSellers();
  }

  fetchSellers(): void {
    if (this.userCache[this.currentPage]) {
      // Load  cache
      this.users = this.userCache[this.currentPage];
      this.updatePaginationState();
    } else {
      // Fetch  server
      this.sub = this.customerService.getPaginatedSellers(this.currentPage, this.itemsPerPage).subscribe({
        next: (res) => {
          this.users = res.data.result;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = !!res.data.previous;
          this.dropdownStates = new Array(this.users.length).fill(false);
          this.userCache[this.currentPage] = this.users; // caching
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
    this.backupUser = { ...this.selectedUser }; // <-- backup the original data
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
    this.sub4 = this.customerService.activateSeller(SSN).subscribe({
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
      user.isActive = isActive ; 
    }
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  toggleEdit(event?: any): void {
    if (this.editing) {
      const workingBackup = { ...this.backupUser }; // Existing backup of data when editing was activated
      this.sub5 = this.customerService.updateSeller(this.selectedUser._id, this.selectedUser).subscribe({
        next: (res: any) => {
          if (res.message === 'success') {
            const index = this.users.findIndex(u => u.SSN === this.selectedUser.SSN);
            if (index !== -1) {
              //! update the user in the users array
              this.users[index] = { ...this.selectedUser };
              //! Update backup user
              this.backupUser = { ...this.selectedUser };
            }
          } else {
            const index = this.users.findIndex(u => u.SSN === workingBackup.SSN);
            if (index !== -1) {
              this.users[index] = workingBackup;
              this.selectedUser = workingBackup;
            }
          }
          this.editing = false;
        },
        error: (error) => {
          console.error('Error updating seller info', error);
          const index = this.users.findIndex(u => u.SSN === workingBackup.SSN);
          if (index !== -1) {
            this.users[index] = workingBackup;
            this.selectedUser = workingBackup;
          }
          this.editing = false;
        }
      });
    } else {
      // Entering edit mode: create a new backup of the selectedUser for reversion if needed
      this.backupUser = { ...this.selectedUser };
      this.editing = true;
    }
    if (event && event.target) event.target.blur();
  }

  triggerImageUploadSeller(): void {
    document.getElementById('imageUploadSeller')?.click();
  }

  async onImageChangeSeller(event: any): Promise<void> {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file && this.selectedUser) {
      const backupUrl = this.selectedUser.photo.url;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const tempUrl = e.target.result;
        //+  confirm dialog  then update image if confirmed
        const dialogRef = this.dialog.open(ConfirmDialogImgchangeComponent);
        this.sub6 =dialogRef.afterClosed().subscribe(async result => {
          if (result) {
            try {
              const response: any = await this.customerService.changeImage(this.selectedUser!._id, file).toPromise();
              if (response.data.acknowledged) {
                this.selectedUser!.photo.url = tempUrl;
              } else {
                this.selectedUser!.photo.url = backupUrl;
              }
            } catch (error) {
              console.error('Error updating image', error);
              this.selectedUser!.photo.url = backupUrl;
            }
          } else {
            this.selectedUser!.photo.url = backupUrl;
          }
          //! Reset the file input
          fileInput.value = '';
        });
      };
      reader.readAsDataURL(file);
    }
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

    if (this.sub5) {
      this.sub.unsubscribe();
    }

    if (this.sub6) {
      this.sub.unsubscribe();
    }
  }
}