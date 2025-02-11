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
import {MatDividerModule} from '@angular/material/divider';
import { ConfirmDialogApprovesellerComponent } from '../../../confirm-dialog-approveseller/confirm-dialog-approveseller.component';
import { ConfirmDialogRejectsellerComponent } from '../../../confirm-dialog-rejectseller/confirm-dialog-rejectseller.component';
import { ConfirmDialogApproveseller2Component } from '../../../confirm-dialog-approveseller2/confirm-dialog-approveseller2.component';



@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule , MatButtonToggleModule , MatDividerModule],
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
  sub7: Subscription = {} as Subscription;
  sub8: Subscription = {} as Subscription;
  sub9: Subscription = {} as Subscription;
  sub10: Subscription = {} as Subscription;
  sub11: Subscription = {} as Subscription;
  sub12: Subscription = {} as Subscription;
  sub13: Subscription = {} as Subscription;
  sub14: Subscription = {} as Subscription;
  sub15: Subscription = {} as Subscription;
  sub16: Subscription = {} as Subscription;
  sub17: Subscription = {} as Subscription;
  sub18: Subscription = {} as Subscription;
  sub19: Subscription = {} as Subscription;


  users: User[] = [];

  isDarkMode: boolean = false;

  currentPage: number = 1;

  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  userCache: { [page: number]: User[] } = {};
  waitingUserCache: { [page: number]: User[] } = {};
  rejectedUserCache: { [page: number]: User[] } = {};
  approvedUserCache: { [page: number]: User[] } = {};

  selectedUser: User = {} as User;
  backupUser: User = {} as User; 

  editing: boolean = false;
  
  activeSellersCount: any;
  deActiveSellersCount: any;
  waitingSellersCount: any;
  rejectedSellersCount: any;

  ngOnInit(): void {
    this.fetchSellers();
    this.getDeActiveSellersCount();
    this.getActiveSellersCount();
    this.getWaitingSellersCount();
    this.getRejectedSellersCount();
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


  fetchWaitingSellers(): void {
    if (this.waitingUserCache[this.currentPage]) {
      // Load waiting cache
      this.users = this.waitingUserCache[this.currentPage];
      this.updatePaginationState();
    } else {
      // Fetch from server and cache in waitingUserCache
      this.sub2 = this.customerService.getPaginatedWaitingSellers(this.currentPage, this.itemsPerPage).subscribe({
        next: (res) => {
          this.users = res.data.result;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = !!res.data.previous;
          this.dropdownStates = new Array(this.users.length).fill(false);
          this.waitingUserCache[this.currentPage] = this.users; // caching waiting sellers
          this.updatePaginationState();
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

  fetchRejectedSellers(): void {
    if (this.rejectedUserCache && this.rejectedUserCache[this.currentPage]) {
      // Load cache
      this.users = this.rejectedUserCache[this.currentPage];
      this.updatePaginationState();
    } else {
      // Fetch from server and cache in rejectedUserCache
      this.sub3 = this.customerService.getPaginatedRejectedSellers(this.currentPage, this.itemsPerPage).subscribe({
        next: (res) => {
          this.users = res.data.result;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.hasNextPage = !!res.data.next;
          this.hasPreviousPage = !!res.data.previous;
          this.dropdownStates = new Array(this.users.length).fill(false);
          if (!this.rejectedUserCache) {
            this.rejectedUserCache = {};
          }
          this.rejectedUserCache[this.currentPage] = this.users; // caching rejected sellers
          this.updatePaginationState();
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

fetchApprovedSellers(): void {
  if (this.approvedUserCache[this.currentPage]) {
    // Load cache
    this.users = this.approvedUserCache[this.currentPage];
    this.updatePaginationState();
  } else {
    // Fetch from server
    this.sub4 = this.customerService.getPaginatedApprovedSellers(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.users = res.data.result;
        this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
        this.hasNextPage = !!res.data.next;
        this.hasPreviousPage = !!res.data.previous;
        this.dropdownStates = new Array(this.users.length).fill(false);
        this.approvedUserCache[this.currentPage] = this.users; // caching approved sellers
        this.updatePaginationState();
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

  showSellerInfo(user: User): void {
    this.selectedUser = {
      ...user,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    };
    this.backupUser = { ...this.selectedUser }; //+ <-- backup the original data
  }

  //! ////////////////////////// Activate - Deactivate - Approve - Reject - Dialogs ////////////////////////////////////


  deActiveSeller(_id: string): void {
    this.sub5 = this.customerService.deActiveSeller(_id).subscribe({
        next: (res) => {
            console.log(res);
            this.updateUserAcitvity(_id, false);
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

  activateSeller(_id: string): void {
    this.sub6 = this.customerService.activateSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        this.updateUserAcitvity(_id, true);
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

  approveSeller(_id: string, source: 'pending' | 'rejected' = 'pending'): void {
    this.sub7 = this.customerService.approveSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        this.users = this.users.filter((user: User) => user._id !== _id);

        this.activeSellersCount++;
        if (source === 'pending') {
          this.waitingSellersCount--;
          this.approvedUserCache[this.currentPage] = this.approvedUserCache[this.currentPage]?.filter((user: User) => user._id !== _id) || [];
        } else if (source === 'rejected') {
          this.rejectedSellersCount--;
          this.rejectedUserCache[this.currentPage] = this.rejectedUserCache[this.currentPage]?.filter((user: User) => user._id !== _id) || [];
        }
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

  rejectSeller(_id: string): void {
    this.sub8 = this.customerService.rejectSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        this.users = this.users.filter((user: User) => user._id !== _id);
        this.rejectedUserCache[this.currentPage] = this.rejectedUserCache[this.currentPage]?.filter((user: User) => user._id !== _id) || [];
        this.rejectedSellersCount++;
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

  openConfirmDialog(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    this.sub9 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deActiveSeller(_id);
      }
    });
  }

  openConfirmDialog2(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);

    this.sub10 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activateSeller(_id);
      }
    });
  }

  openConfirmDialog3(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogApprovesellerComponent);

    this.sub11 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveSeller(_id, 'pending');
      }
    });
  }

  openConfirmDialog5(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogApproveseller2Component);

    this.sub19 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveSeller(_id, 'rejected');
      }
    });
  }

  openConfirmDialog4(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogRejectsellerComponent);

    this.sub12 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rejectSeller(_id);
      }
    });
  }


//! ///////////////////////////////////////////////////////////////////


  updateUserAcitvity(_id: string, isActive: boolean): void {
    const user = this.users.find(u => u._id === _id);
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
      this.sub13 = this.customerService.updateSeller(this.selectedUser._id, this.selectedUser).subscribe({
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
        this.sub14 =dialogRef.afterClosed().subscribe(async result => {
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

  //! Getting Totals:

  getActiveSellersCount(): void {
    this.sub15 = this.customerService.getActiveSellersCount().subscribe({
      next: (res) => {
        this.activeSellersCount = res.data;
      },
      error: (error) => {
        console.error('Error getting active sellers count', error);
      }
    });
  }

  getDeActiveSellersCount(): void {
    this.sub16 = this.customerService.getDeActiveSellersCount().subscribe({
      next: (res) => {
        this.deActiveSellersCount = res.data;
      },
      error: (error) => {
        console.error('Error getting deactive sellers count', error);
      }
    });
  }

  getWaitingSellersCount(): void {
    this.sub17 = this.customerService.getWaitingSellersCount().subscribe({
      next: (res) => {
        this.waitingSellersCount = res.data;
      },
      error: (error) => {
        console.error('Error getting waiting sellers count', error);
      }
    });
  }

  getRejectedSellersCount(): void {
    this.sub18 = this.customerService.getRejectedSellersCount().subscribe({
      next: (res) => {
        this.rejectedSellersCount = res.data;
      },
      error: (error) => {
        console.error('Error getting rejected sellers count', error);
      }
    });
  }


  //+ ////////////////////////////////////////////////////////////////////////////////////////////

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

    if (this.sub7) {
      this.sub.unsubscribe();
    }

    if (this.sub8) {
      this.sub.unsubscribe();
    }

    if (this.sub9) {
      this.sub.unsubscribe();
    }

    if (this.sub10) {
      this.sub.unsubscribe();
    }

    if (this.sub11) {
      this.sub.unsubscribe();
    }

    if (this.sub12) {
      this.sub.unsubscribe();
    }

    if (this.sub13) {
      this.sub.unsubscribe();
    }

    if (this.sub14) {
      this.sub.unsubscribe();
    }

    if (this.sub15) {
      this.sub.unsubscribe();
    }

    if (this.sub16) {
      this.sub.unsubscribe();
    }

    if (this.sub17) {
      this.sub.unsubscribe();
    }

    if (this.sub18) {
      this.sub.unsubscribe();
    }

    if (this.sub19) {
      this.sub.unsubscribe();
    }
  }
}