import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../../../_models/user';
import { CustomersService } from '../../../_services/customers.service';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { ConfirmDialogImgchangeComponent } from '../../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDialogApprovesellerComponent } from '../../../confirm-dialog-approveseller/confirm-dialog-approveseller.component';
import { ConfirmDialogRejectsellerComponent } from '../../../confirm-dialog-rejectseller/confirm-dialog-rejectseller.component';
import { ConfirmDialogApproveseller2Component } from '../../../confirm-dialog-approveseller2/confirm-dialog-approveseller2.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule, MatButtonToggleModule, MatDividerModule , MatMenuModule , MatProgressSpinnerModule , NgxSkeletonLoaderModule],
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.css', './sellers.component.scss']
})
export class SellersComponent implements OnInit, OnDestroy {

  @Input('myclass')
  panelClass!: string;
  // Filter state and pagination
  currentFilter: 'active' | 'waiting' | 'rejected' | 'approved' = 'active';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  users: User[] = [];
  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedUser: User = {} as User;
  backupUser: User = {} as User;
  editing: boolean = false;

  // Totals
  activeSellersCount: any;
  deActiveSellersCount: any;
  waitingSellersCount: any;
  rejectedSellersCount: any;

  subscriptions: Subscription[] = [];

  // New cache for storing seller pages: keys are "<filter>_<page>"
  pageCache: { [key: string]: { result: User[]; total: number } } = {};

  selectedFilter: string = 'name'; // Default filter
  searchQuery: string = '';

  // Add this property
  showNoResults: boolean = false;

  // Add this new property
  lastSearchFilter: string = 'name';

  // Add this new property
  isLoading: boolean = true;

  // Add these properties after other properties
  sortField: 'name' | 'createdAt' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  constructor(private customerService: CustomersService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadSellers();
    this.getDeActiveSellersCount();
    this.getActiveSellersCount();
    this.getWaitingSellersCount();
    this.getRejectedSellersCount();
  }

  hideSingleSelectionIndicator = signal(true);


  // Consolidated seller loading method with caching
  loadSellers(): void {
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}`;
    if (this.pageCache[cacheKey]) {
      const cached = this.pageCache[cacheKey];
      this.users = cached.result;
      this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
      this.dropdownStates = new Array(this.users.length).fill(false);
      this.updatePaginationState();
      this.showNoResults = false;
      return;
    }

    // Only set loading when making a server request
    this.isLoading = true;
    this.users = []; // Clear the users array when loading from server
  
    let status: number | undefined;
    if (this.currentFilter === 'waiting') {
      status = 0;
    } else if (this.currentFilter === 'rejected') {
      status = -1;
    } else if (this.currentFilter === 'approved') {
      status = 1;
    }
    
    // Add sort parameters if present
    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      if (this.sortField === 'name') {
        sortParam = `&sort=firstName:${this.sortDirection}`; // Changed from name to firstName
      } else {
        sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
      }
    }
    
    const obs = this.customerService.getPaginatedSellersByStatus(
      this.currentPage, 
      this.itemsPerPage, 
      status,
      sortParam
    );
    
    const sub = obs.subscribe({
      next: (res) => {
        this.users = res.data.result;
        this.showNoResults = false;
        const total = res.data.total;
        this.totalPages = Math.ceil(total / this.itemsPerPage);
        this.dropdownStates = new Array(this.users.length).fill(false);
        this.pageCache[cacheKey] = { result: this.users, total: total };
        this.updatePaginationState();
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadSellers();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadSellers();
      }
    }
  }

  setFilter(filter: 'active' | 'waiting' | 'rejected' | 'approved'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.showNoResults = false; // Reset the no results flag when changing filters
    this.loadSellers();
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
    this.backupUser = { ...this.selectedUser };
  }

  // Seller actions
  deActiveSeller(_id: string): void {
    const sub = this.customerService.deActiveSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        this.updateUserActivity(_id, false);
        // Refresh counts after deactivation
        this.getActiveSellersCount();
        this.getDeActiveSellersCount();
      },
      error: (error) => console.log(error)
    });
    this.subscriptions.push(sub);
  }

  activateSeller(_id: string): void {
    const sub = this.customerService.activateSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        this.updateUserActivity(_id, true);
        // Refresh counts after activation
        this.getActiveSellersCount();
        this.getDeActiveSellersCount();
      },
      error: (error) => console.log(error)
    });
    this.subscriptions.push(sub);
  }

  approveSeller(_id: string, source: 'pending' | 'rejected' = 'pending'): void {
    const sub = this.customerService.approveSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        const sourceStatus = source === 'pending' ? 'waiting' : 'rejected';
        const approvedSeller = this.users.find(user => user._id === _id);
        
        if (approvedSeller) {
          // Remove from current list
          this.users = this.users.filter(user => user._id !== _id);
          
          // Update seller status
          approvedSeller.status = '1';

          // Update source cache pages
          Object.keys(this.pageCache).forEach(key => {
            if (key.startsWith(`${sourceStatus}_`)) {
              const cache = this.pageCache[key];
              cache.result = cache.result.filter(user => user._id !== _id);
              cache.total--;
            }
          });

          // Add to first page of approved cache
          const approvedFirstPageKey = `approved_1_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[approvedFirstPageKey]) {
            const firstPageCache = this.pageCache[approvedFirstPageKey];
            // Insert at beginning, remove last item if page is full
            firstPageCache.result.unshift(approvedSeller);
            if (firstPageCache.result.length > this.itemsPerPage) {
              firstPageCache.result.pop();
            }
            firstPageCache.total++;
          }

          // Refresh counts
          this.getActiveSellersCount();
          if (source === 'pending') {
            this.getWaitingSellersCount();
          } else {
            this.getRejectedSellersCount();
          }
        }
      },
      error: (error) => console.log(error)
    });
    this.subscriptions.push(sub);
  }

  rejectSeller(_id: string): void {
    const sub = this.customerService.rejectSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        const rejectedSeller = this.users.find(user => user._id === _id);
        
        if (rejectedSeller) {
          // Remove from current list
          this.users = this.users.filter(user => user._id !== _id);
          
          // Update seller status
          rejectedSeller.status = '-1';

          // Update waiting cache pages
          Object.keys(this.pageCache).forEach(key => {
            if (key.startsWith('waiting_')) {
              const cache = this.pageCache[key];
              cache.result = cache.result.filter(user => user._id !== _id);
              cache.total--;
            }
          });

          // Add to first page of rejected cache
          const rejectedFirstPageKey = `rejected_1_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[rejectedFirstPageKey]) {
            const firstPageCache = this.pageCache[rejectedFirstPageKey];
            // Insert at beginning, remove last item if page is full
            firstPageCache.result.unshift(rejectedSeller);
            if (firstPageCache.result.length > this.itemsPerPage) {
              firstPageCache.result.pop();
            }
            firstPageCache.total++;
          }

          // Refresh counts
          this.getWaitingSellersCount();
          this.getRejectedSellersCount();
        }
      },
      error: (error) => console.log(error)
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deActiveSeller(_id);
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog2(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activateSeller(_id);
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog3(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogApprovesellerComponent);
    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveSeller(_id, 'pending');
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog5(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogApproveseller2Component);
    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveSeller(_id, 'rejected');
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog4(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogRejectsellerComponent);
    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rejectSeller(_id);
      }
    });
    this.subscriptions.push(sub);
  }

  updateUserActivity(_id: string, isActive: boolean): void {
    const user = this.users.find(u => u._id === _id);
    if (user) {
      user.isActive = isActive;
    }
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  toggleEdit(event?: any): void {
    if (this.editing) {
      const workingBackup = { ...this.backupUser };
      const sub = this.customerService.updateSeller(this.selectedUser._id, this.selectedUser).subscribe({
        next: (res: any) => {
          if (res.message === 'success') {
            const index = this.users.findIndex(u => u.SSN === this.selectedUser.SSN);
            if (index !== -1) {
              this.users[index] = { ...this.selectedUser };
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
      this.subscriptions.push(sub);
    } else {
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
        const dialogRef = this.dialog.open(ConfirmDialogImgchangeComponent);
        const sub = dialogRef.afterClosed().subscribe(async result => {
          if (result) {
            try {
              const response: any = await this.customerService.changeImage(this.selectedUser._id, file).toPromise();
              if (response.data.acknowledged) {
                this.selectedUser.photo.url = tempUrl;
              } else {
                this.selectedUser.photo.url = backupUrl;
              }
            } catch (error) {
              console.error('Error updating image', error);
              this.selectedUser.photo.url = backupUrl;
            }
          } else {
            this.selectedUser.photo.url = backupUrl;
          }
          fileInput.value = '';
        });
        this.subscriptions.push(sub);
      };
      reader.readAsDataURL(file);
    }
  }

  // Totals fetching
  getActiveSellersCount(): void {
    const sub = this.customerService.getActiveSellersCount().subscribe({
      next: (res) => { this.activeSellersCount = res.data; },
      error: (error) => console.error('Error getting active sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getDeActiveSellersCount(): void {
    const sub = this.customerService.getDeActiveSellersCount().subscribe({
      next: (res) => { this.deActiveSellersCount = res.data; },
      error: (error) => console.error('Error getting deactive sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getWaitingSellersCount(): void {
    const sub = this.customerService.getWaitingSellersCount().subscribe({
      next: (res) => { this.waitingSellersCount = res.data; },
      error: (error) => console.error('Error getting waiting sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getRejectedSellersCount(): void {
    const sub = this.customerService.getRejectedSellersCount().subscribe({
      next: (res) => { this.rejectedSellersCount = res.data; },
      error: (error) => console.error('Error getting rejected sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  isSearchMode: boolean = false;
  
  onSearch(event: Event) {
    event.preventDefault();
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.loadSellers();
      return;
    }

    this.isSearchMode = true;
    this.currentPage = 1;
    this.loadSearchResults();
  }

  validateSearchInput(event: KeyboardEvent): boolean {
    const pattern = this.selectedFilter === 'name' 
      ? /^[a-zA-Z\s]$/  // Only letters and spaces for names
      : /^[0-9]$/;      // Only numbers for SSN and phone

    if (!pattern.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    const pattern = this.selectedFilter === 'name'
      ? /^[a-zA-Z\s]*$/  // Only letters and spaces for names
      : /^[0-9]*$/;      // Only numbers for SSN and phone

    if (pattern.test(pastedText)) {
      this.searchQuery = pastedText;
    }
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.value;
    this.searchQuery = ''; // Clear search input when filter changes
  }

  loadSearchResults() {
    let filters: string;
    // Store the current filter as the last used search filter
    this.lastSearchFilter = this.selectedFilter;
    
    if (this.selectedFilter === 'name') {
      const nameParts = this.searchQuery.trim().split(/\s+/);
      
      if (nameParts.length === 1 || (nameParts.length > 1 && !nameParts[1])) {
        // Single name or name with trailing spaces
        filters = `firstName:${nameParts[0]}`;
      } else if (nameParts.length >= 2) {
        // First name and last name (ignore additional parts)
        filters = `firstName:${nameParts[0]}+lastName:${nameParts[1]}`;
      } else {
        filters = 'firstName:';  // Empty search
      }
    } else {
      // For other filters (SSN, phoneNumber)
      filters = `${this.selectedFilter}:${this.searchQuery}`;
    }
  
    // Add sort parameters if present
    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      if (this.sortField === 'name') {
        sortParam = `&sort=firstName:${this.sortDirection}`;  // Changed from name to firstName
      } else {
        sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
      }
    }
  
    const sub = this.customerService.searchSellers(
      filters,
      this.currentPage,
      this.itemsPerPage,
      sortParam
    ).subscribe({
      next: (res) => {
        if (res.data) {
          this.users = Array.isArray(res.data.result) ? res.data.result : [res.data.result];
          this.showNoResults = this.users.length === 0;
          this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
          this.dropdownStates = new Array(this.users.length).fill(false);
          this.updatePaginationState();
        }
      },
      error: (error) => {
        console.error('Error searching sellers:', error);
        this.users = [];
        this.showNoResults = true;
        this.updatePaginationState();
      }
    });
    
    this.subscriptions.push(sub);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
    // Clear the cache when changing items per page
    this.pageCache = {};
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadSellers();
    }
  }

  // Add sorting method
  toggleSort(field: 'name' | 'createdAt'): void {
    if (this.sortField === field) {
      // Toggle direction if same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, start with ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Reset to first page when sorting
    this.currentPage = 1;
    
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadSellers();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}