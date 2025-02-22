import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../../_services/category.service';
import { category } from '../../../_models/category';

@Component({
  selector: 'app-catagories',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './catagories.component.html',
  styleUrl: './catagories.component.css'
})

export class CatagoriesComponent implements OnInit, OnDestroy{
  currentFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  users: category[] = [];
  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedUser: category = {} as category;
  backupUser: category = {} as category;
  editing: boolean = false;

  subscriptions: Subscription[] = [];

  // New cache for storing seller pages: keys are "<filter>_<page>"
  pageCache: { [key: string]: { result: category[]; total: number } } = {};

  selectedFilter: string = 'name'; // Default filter
  searchQuery: string = '';

  showNoResults: boolean = false;

  lastSearchFilter: string = 'name';

  isLoading: boolean = true;

  sortField: 'name' | 'createdAt' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  searchPlaceholder: string = ' Search By Name...';

  tokenData: any = null;

  activeCustomersCount: any = null; 
  inactiveCustomersCount : any = null;


  constructor(
    private supplierService: CategoryService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.updateSearchPlaceholder();
    this.loadSellers();
    this.getInActiveCustomersCount();
    this.getActiveCustomersCount();
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
  }

  hideSingleSelectionIndicator = signal(true);

  // Consolidated seller loading method with caching
  loadSellers(): void {
    // Check cache before setting loading state
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}`;

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
    if (this.currentFilter === 'active') {
      filterParam = 'isActive:true';
    } else if (this.currentFilter === 'inactive') {
      filterParam = 'isActive:false';
    }

    // Add sort parameters
    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${
        this.sortField === 'name' ? 'name' : this.sortField
      }:${this.sortDirection}`;
    }

    const obs = this.supplierService.getPaginatedCustomersByStatus(
      this.currentPage,
      this.itemsPerPage,
      filterParam,
      sortParam
    );

    const sub = obs.subscribe({
      next: (res) => {
        this.users = res.categories;
        this.showNoResults = false;
        const total =2; ////!!!!!!!!!!!!!
        this.totalPages = Math.ceil(total / this.itemsPerPage);
        this.dropdownStates = new Array(this.users.length).fill(false);
        this.pageCache[cacheKey] = { result: this.users, total: total };
        this.updatePaginationState();
        this.isLoading = false;
        console.log(res);
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        console.log(error);
        this.isLoading = false;
      },
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

  setFilter(filter: string): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.showNoResults = false;

    this.updateSearchPlaceholder();
    this.loadSellers();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  showSellerInfo(user: category): void {
    this.selectedUser = {
      ...user,
      id: user.id || '',
      parentCatId: user.parentCatId || '',
      name: user.name || '',
    };
    this.backupUser = { ...this.selectedUser };
    console.log(this.selectedUser);
  }

  // Customer actions
  deActiveCustomer(id: string): void {
    const sub = this.supplierService.deActiveCustomer(id).subscribe({
      next: (res) => {
        console.log(res);
        const deactivatedCustomer = this.users.find((u) => u.id === id);
        if (deactivatedCustomer) {
          // Remove from current active list
          this.users = this.users.filter((user) => user.id !== id);
          deactivatedCustomer.isActive = false;
          
          // Remove from active cache (using "active" prefix)
          const activeKey = `active_${this.currentPage}_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[activeKey]) {
            this.pageCache[activeKey].result = this.pageCache[activeKey].result.filter((user) => user.id !== id);
            this.pageCache[activeKey].total--;
          }
          
          // Add to first page of inactive cache (using "inactive" prefix)
          const inactiveKey = `inactive_1_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[inactiveKey]) {
            const inactiveCache = this.pageCache[inactiveKey];
            inactiveCache.result.unshift(deactivatedCustomer);
            if (inactiveCache.result.length > this.itemsPerPage) {
              inactiveCache.result.pop();
            }
            inactiveCache.total++;
          }
          
          this.getInActiveCustomersCount();
          this.getActiveCustomersCount();
        }
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        console.log(error);
      },
    });
    this.subscriptions.push(sub);
  }

  activateCustomer(id: string): void {
    const sub = this.supplierService.activateCustomer(id).subscribe({
      next: (res) => {
        console.log(res);
        const activatedCustomer = this.users.find((u) => u.id === id);
        if (activatedCustomer) {
          // Remove from current inactive list
          this.users = this.users.filter((user) => user.id !== id);
          activatedCustomer.isActive = true;
          
          // Remove from inactive cache (using "inactive" prefix)
          const inactiveKey = `inactive_${this.currentPage}_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[inactiveKey]) {
            this.pageCache[inactiveKey].result = this.pageCache[inactiveKey].result.filter((user) => user.id !== id);
            this.pageCache[inactiveKey].total--;
          }
          
          // Add to first page of active cache (using "active" prefix)
          const activeKey = `active_1_${this.sortField}_${this.sortDirection}`;
          if (this.pageCache[activeKey]) {
            const activeCache = this.pageCache[activeKey];
            activeCache.result.unshift(activatedCustomer);
            if (activeCache.result.length > this.itemsPerPage) {
              activeCache.result.pop();
            }
            activeCache.total++;
          }
          this.getInActiveCustomersCount();
          this.getActiveCustomersCount();
        }
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        console.log(error);
      },
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deActiveCustomer(id);
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog2(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.activateCustomer(id);
      }
    });
    this.subscriptions.push(sub);
  }

  updateUserActivity(id: string, isActive: boolean): void {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.isActive = isActive;
    }
  }

  getActiveCustomersCount(): void {
    const sub = this.supplierService.getActiveCustomersCount().subscribe({
      next: (res) => { this.activeCustomersCount = res.data; },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        console.error('Error getting active sellers count', error);
      }
    });
    this.subscriptions.push(sub);
  }

  getInActiveCustomersCount(): void {
    const sub = this.supplierService.getInActiveCustomersCount().subscribe({
      next: (res) => { this.inactiveCustomersCount = res.data; },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        console.error('Error getting deactive sellers count', error);
      }
    });
    this.subscriptions.push(sub);
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) =>
      i === index ? !state : false
    );
  }

  toggleEdit(event?: any): void {
    if (this.editing) {
      const workingBackup = { ...this.backupUser };
      const sub = this.supplierService
        .updateCustomer(this.selectedUser.id, this.selectedUser)
        .subscribe({
          next: (res: any) => {
            if (res.message === 'success') {
              const index = this.users.findIndex(
                (u) => u.id === this.selectedUser.id
              );
              if (index !== -1) {
                this.users[index] = { ...this.selectedUser };
                this.backupUser = { ...this.selectedUser };
              }
            } else {
              const index = this.users.findIndex(
                (u) => u.id === workingBackup.id
              );
              if (index !== -1) {
                this.users[index] = workingBackup;
                this.selectedUser = workingBackup;
              }
            }
            this.editing = false;
          },
          error: (error) => {
            this.toaster.clear();
            this.toaster.error(error.error.message, 'Failed', {
              timeOut: 1500,
              positionClass: 'toast-bottom-right',
              progressBar: true,
              closeButton: true
            });
            console.error('Error updating seller info', error);
            const index = this.users.findIndex(
              (u) => u.id === workingBackup.id
            );
            if (index !== -1) {
              this.users[index] = workingBackup;
              this.selectedUser = workingBackup;
            }
            this.editing = false;
          },
        });
      this.subscriptions.push(sub);
    } else {
      this.backupUser = { ...this.selectedUser };
      this.editing = true;
    }
    if (event && event.target) event.target.blur();
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

  resetSearch(): void {
    this.searchQuery = '';
    this.isSearchMode = false;
    this.currentFilter = ''; // reset filter to show all statuses
    this.currentPage = 1;
    this.sortField = null;
    this.sortDirection = null;
    this.loadSellers();
    this.updateSearchPlaceholder();
  }

  validateSearchInput(event: KeyboardEvent): boolean {
    const pattern =
      this.selectedFilter === 'name'
        ? /^[a-zA-Z\s]$/ // Only letters and spaces for names
        : /^[0-9]$/; // Only numbers for SSN and phone

    if (!pattern.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';

    const pattern =
      this.selectedFilter === 'name'
        ? /^[a-zA-Z\s]*$/ // Only letters and spaces for names
        : /^[0-9]*$/; // Only numbers for SSN and phone

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
      const nameParts = this.searchQuery;
     
        searchFilter = `companyName:${nameParts[0]}`;
      
    } else {
      searchFilter = `${this.selectedFilter}:${this.searchQuery}`;
    }

    // Update status filter: only add filter when explicitly set to 'active' or 'inactive'
    const statusFilter =
      this.currentFilter === 'active'
        ? '+isActive:true'
        : this.currentFilter === 'inactive'
        ? '+isActive:false'
        : '';

    filters = searchFilter + statusFilter;

    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${
        this.sortField === 'name' ? 'name' : this.sortField
      }:${this.sortDirection}`;
    }

    const sub = this.supplierService
      .searchCustomers(filters, this.currentPage, this.itemsPerPage, sortParam)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.users = Array.isArray(res.data.result)
              ? res.data.result
              : [res.data.result];
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
        },
      });

    this.subscriptions.push(sub);
  }

  updateSearchPlaceholder() {
    const filterType =
      this.selectedFilter === 'phoneNumber'
        ? 'Phone Number'
        : this.selectedFilter === 'SSN'
        ? 'SSN'
        : 'Name';
    const status =
      this.currentFilter === 'active'
        ? 'Active'
        : this.currentFilter === 'inactive'
        ? 'Inactive'
        : 'All';
    this.searchPlaceholder = `Search ${status} Supplier By ${filterType}...`;
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
