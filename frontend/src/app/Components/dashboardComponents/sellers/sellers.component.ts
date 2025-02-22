import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User } from '../../../_models/user';
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
import { SellerService } from '../../../_services/seller.service';
import { decodeToken } from '../../../_helpers/jwt-helper';

@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule, MatButtonToggleModule, MatDividerModule , MatMenuModule , MatProgressSpinnerModule , NgxSkeletonLoaderModule],
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.css', './sellers.component.scss']
})
export class SellersComponent implements OnInit, OnDestroy {


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

  showNoResults: boolean = false;

  lastSearchFilter: string = 'name';

  isLoading: boolean = true;

  sortField: 'name' | 'createdAt' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  showingActive: boolean | null = null;
  activityFilter: boolean | null = null;

  searchPlaceholder: string = ' Search By Name...';

  tokenData: any = null;


  constructor(private sellerService: SellerService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.updateSearchPlaceholder();
    this.loadSellers();
    this.getDeActiveSellersCount();
    this.getActiveSellersCount();
    this.getWaitingSellersCount();
    this.getRejectedSellersCount();

    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
  }

  hideSingleSelectionIndicator = signal(true);


  // Consolidated seller loading method with caching
  loadSellers(): void {
    // Check cache before setting loading state
    const activityFilterKey = this.activityFilter !== null ? `_active:${this.activityFilter}` : '';
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}${activityFilterKey}`;
  
    if (this.pageCache[cacheKey]) {
      const cached = this.pageCache[cacheKey];
      this.users = cached.result;
      this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
      this.dropdownStates = new Array(this.users.length).fill(false);
      this.updatePaginationState();
      this.showNoResults = false;
      this.isLoading = false;
      return;
    }
  
    // Only show loading spinner when fetching from server
    this.isLoading = true;
    this.users = [];
  
    let filterParam = '';
    if (this.currentFilter === 'waiting') {
      filterParam = 'status:0';
    } else if (this.currentFilter === 'rejected') {
      filterParam = 'status:-1';
    } else if (this.currentFilter === 'approved') {
      // Always include both status and activity for approved sellers
      filterParam = `status:1${this.activityFilter !== null ? '+isActive:' + this.activityFilter : ''}`;
    }
  
    // Add sort parameters
    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${this.sortField === 'name' ? 'name' : this.sortField}:${this.sortDirection}`;
    }
  
    const obs = this.sellerService.getPaginatedSellersByStatus(
      this.currentPage, 
      this.itemsPerPage, 
      filterParam,
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
        console.log(res);
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
    this.showNoResults = false;
    
    if (filter === 'approved') {
      this.activityFilter = null;
      this.showingActive = null;
    }
    
    this.updateSearchPlaceholder();
    this.loadSellers();
  }

  filterByActivity(isActive: boolean): void {
    if (this.showingActive === isActive) return;
    
    this.showingActive = isActive;
    this.activityFilter = isActive;
    this.currentPage = 1;
    
    this.updateSearchPlaceholder();
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
    const sub = this.sellerService.deActiveSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        const deactivatedSeller = this.users.find(u => u._id === _id);
        if (deactivatedSeller) {
          if (this.currentFilter === 'approved' && this.activityFilter === true) {
            // In approved view filtered to Active: remove seller and update caches
            this.users = this.users.filter(user => user._id !== _id);
            const activeKey = `approved_${this.currentPage}_${this.sortField}_${this.sortDirection}_active:true`;
            if (this.pageCache[activeKey]) {
              this.pageCache[activeKey].result = this.pageCache[activeKey].result.filter(user => user._id !== _id);
              this.pageCache[activeKey].total--;
            }
            const inactiveKey = `approved_1_${this.sortField}_${this.sortDirection}_active:false`;
            if (this.pageCache[inactiveKey]) {
              this.pageCache[inactiveKey].result.unshift(deactivatedSeller);
              if (this.pageCache[inactiveKey].result.length > this.itemsPerPage) {
                this.pageCache[inactiveKey].result.pop();
              }
              this.pageCache[inactiveKey].total++;
            }
          } else {
            // In mixed view or when no specific activity filter is set: update status only
            deactivatedSeller.isActive = false;
            // For cache keys that include activity filter, update if present.
            const keyActive = `approved_${this.currentPage}_${this.sortField}_${this.sortDirection}_active:true`;
            if (this.pageCache[keyActive]) {
              const cachedSeller = this.pageCache[keyActive].result.find(u => u._id === _id);
              if (cachedSeller) { cachedSeller.isActive = false; }
            }
          }
          this.getActiveSellersCount();
          this.getDeActiveSellersCount();
        }
      },
      error: (error) => { console.log(error); }
    });
    this.subscriptions.push(sub);
  }

  activateSeller(_id: string): void {
    const sub = this.sellerService.activateSeller(_id).subscribe({
      next: (res) => {
        console.log(res);
        const activatedSeller = this.users.find(u => u._id === _id);
        if (activatedSeller) {
          if (this.currentFilter === 'approved' && this.activityFilter === false) {
            // In approved view filtered to Inactive: remove seller and update caches
            this.users = this.users.filter(user => user._id !== _id);
            const inactiveKey = `approved_${this.currentPage}_${this.sortField}_${this.sortDirection}_active:false`;
            if (this.pageCache[inactiveKey]) {
              this.pageCache[inactiveKey].result = this.pageCache[inactiveKey].result.filter(user => user._id !== _id);
              this.pageCache[inactiveKey].total--;
            }
            const activeKey = `approved_1_${this.sortField}_${this.sortDirection}_active:true`;
            if (this.pageCache[activeKey]) {
              this.pageCache[activeKey].result.unshift(activatedSeller);
              if (this.pageCache[activeKey].result.length > this.itemsPerPage) {
                this.pageCache[activeKey].result.pop();
              }
              this.pageCache[activeKey].total++;
            }
          } else {
            // In mixed view: update status only
            activatedSeller.isActive = true;
            const keyInactive = `approved_${this.currentPage}_${this.sortField}_${this.sortDirection}_active:false`;
            if (this.pageCache[keyInactive]) {
              const cachedSeller = this.pageCache[keyInactive].result.find(u => u._id === _id);
              if (cachedSeller) { cachedSeller.isActive = true; }
            }
          }
          this.getActiveSellersCount();
          this.getDeActiveSellersCount();
        }
      },
      error: (error) => { console.log(error); }
    });
    this.subscriptions.push(sub);
  }

  approveSeller(_id: string, source: 'pending' | 'rejected' = 'pending'): void {
    const sub = this.sellerService.approveSeller(_id).subscribe({
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
    const sub = this.sellerService.rejectSeller(_id).subscribe({
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
      const sub = this.sellerService.updateSeller(this.selectedUser._id, this.selectedUser).subscribe({
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
              const response: any = await this.sellerService.changeImage(this.selectedUser._id, file).toPromise();
              if (response.message  === 'success') {
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
    const sub = this.sellerService.getActiveSellersCount().subscribe({
      next: (res) => { this.activeSellersCount = res.data; },
      error: (error) => console.error('Error getting active sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getDeActiveSellersCount(): void {
    const sub = this.sellerService.getDeActiveSellersCount().subscribe({
      next: (res) => { this.deActiveSellersCount = res.data; },
      error: (error) => console.error('Error getting deactive sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getWaitingSellersCount(): void {
    const sub = this.sellerService.getWaitingSellersCount().subscribe({
      next: (res) => { this.waitingSellersCount = res.data; },
      error: (error) => console.error('Error getting waiting sellers count', error)
    });
    this.subscriptions.push(sub);
  }

  getRejectedSellersCount(): void {
    const sub = this.sellerService.getRejectedSellersCount().subscribe({
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

    // Don't reset filters anymore
    this.isSearchMode = true;
    this.currentPage = 1;
    this.loadSearchResults();
  }

  // Add new resetSearch method
  resetSearch(): void {
    this.searchQuery = '';
    this.isSearchMode = false;
    this.currentFilter = 'active';
    this.showingActive = null;
    this.activityFilter = null;
    this.currentPage = 1;
    this.sortField = null;
    this.sortDirection = null;
    this.loadSellers();
    this.updateSearchPlaceholder();
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
    this.searchQuery = '';
    this.updateSearchPlaceholder();
  }

  loadSearchResults() {
    this.isLoading = true;
    this.showNoResults = false;
    this.users = [];
    
    let filters: string;
    this.lastSearchFilter = this.selectedFilter;
    
    // Build the search filter based on current filter state
    let searchFilter = '';
    if (this.selectedFilter === 'name') {
      const nameParts = this.searchQuery.trim().split(/\s+/);
      if (nameParts.length === 1 || (nameParts.length > 1 && !nameParts[1])) {
        searchFilter = `firstName:${nameParts[0]}`;
      } else if (nameParts.length >= 2) {
        searchFilter = `firstName:${nameParts[0]}+lastName:${nameParts[1]}`;
      }
    } else {
      searchFilter = `${this.selectedFilter}:${this.searchQuery}`;
    }

    // Add status filter based on current filter state
    let statusFilter = '';
    if (this.currentFilter === 'approved') {
      statusFilter = '+status:1';
      if (this.activityFilter !== null) {
        statusFilter += `+isActive:${this.activityFilter}`;
      }
    } else if (this.currentFilter === 'waiting') {
      statusFilter = '+status:0';
    } else if (this.currentFilter === 'rejected') {
      statusFilter = '+status:-1';
    }

    filters = searchFilter + statusFilter;

    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${this.sortField === 'name' ? 'name' : this.sortField}:${this.sortDirection}`;
    }

    const sub = this.sellerService.searchSellers(
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching sellers:', error);
        this.users = [];
        this.showNoResults = true;
        this.updatePaginationState();
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  updateSearchPlaceholder() {
    const filterType = this.selectedFilter === 'phoneNumber' ? 'Phone Number' : 
                      this.selectedFilter === 'SSN' ? 'SSN' : 'Name';
    
    let status = '';
    if (this.currentFilter === 'approved') {
      status = this.showingActive === true ? ' Active' : 
               this.showingActive === false ? ' Inactive' : ' Approved';
    } else if (this.currentFilter === 'waiting') {
      status = ' Pending';
    } else if (this.currentFilter === 'rejected') {
      status = ' Rejected';
    }

    this.searchPlaceholder = `Search${status} Sellers By ${filterType}...`;
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