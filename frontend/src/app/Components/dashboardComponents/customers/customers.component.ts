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
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-customers',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})

export class CustomersComponent implements OnInit, OnDestroy {
  // Filter state and pagination
  currentFilter: string = '';
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

  searchPlaceholder: string = ' Search By Name...';

  tokenData: any = null;

  activeCustomersCount: any = null; 
  inactiveCustomersCount : any = null;


  constructor(
    private customerService: CustomersService,
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

    const obs = this.customerService.getPaginatedCustomersByStatus(
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
    // Toggle filter: if already selected, remove the filter.
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

  showSellerInfo(user: User): void {
    this.selectedUser = {
      ...user,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    };
    this.backupUser = { ...this.selectedUser };
  }

  // Customer actions
  deActiveCustomer(_id: string): void {
    const sub = this.customerService.deActiveCustomer(_id).subscribe({
      next: (res) => {
        // Clear cache and reload updated list
        this.pageCache = {};
        if (this.isSearchMode) {
          this.loadSearchResults();
        } else {
          this.loadSellers();
        }
        this.getInActiveCustomersCount();
        this.getActiveCustomersCount();
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

  activateCustomer(_id: string): void {
    const sub = this.customerService.activateCustomer(_id).subscribe({
      next: (res) => {
        // Clear cache and reload updated list
        this.pageCache = {};
        if (this.isSearchMode) {
          this.loadSearchResults();
        } else {
          this.loadSellers();
        }
        this.getInActiveCustomersCount();
        this.getActiveCustomersCount();
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

  openConfirmDialog(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deActiveCustomer(_id);
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog2(_id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.activateCustomer(_id);
      }
    });
    this.subscriptions.push(sub);
  }

  updateUserActivity(_id: string, isActive: boolean): void {
    const user = this.users.find((u) => u._id === _id);
    if (user) {
      user.isActive = isActive;
    }
  }

  getActiveCustomersCount(): void {
    const sub = this.customerService.getActiveCustomersCount().subscribe({
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
    const sub = this.customerService.getInActiveCustomersCount().subscribe({
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
      const sub = this.customerService
        .updateCustomer(this.selectedUser._id, this.selectedUser)
        .subscribe({
          next: (res: any) => {
            if (res.message === 'success') {
              const index = this.users.findIndex(
                (u) => u.SSN === this.selectedUser.SSN
              );
              if (index !== -1) {
                this.users[index] = { ...this.selectedUser };
                this.backupUser = { ...this.selectedUser };
              }
            } else {
              const index = this.users.findIndex(
                (u) => u.SSN === workingBackup.SSN
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
              (u) => u.SSN === workingBackup.SSN
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
        const sub = dialogRef.afterClosed().subscribe(async (result) => {
          if (result) {
            try {
              const response: any = await this.customerService
                .changeImage(this.selectedUser._id, file)
                .toPromise();
              if (response.message === 'success') {
                this.selectedUser.photo.url = tempUrl;
              } else {
                this.selectedUser.photo.url = backupUrl;
              }
            } catch (error) {
              this.toaster.clear();
              this.toaster.error((error as any).error.message, 'Failed', {
                timeOut: 1500,
                positionClass: 'toast-bottom-right',
                progressBar: true,
                closeButton: true
              });
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
      const nameParts = this.searchQuery.trim().split(/\s+/);
      if (nameParts.length === 1 || (nameParts.length > 1 && !nameParts[1])) {
        searchFilter = `firstName:${nameParts[0]}`;
      } else if (nameParts.length >= 2) {
        searchFilter = `firstName:${nameParts[0]}+lastName:${nameParts[1]}`;
      }
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

    const sub = this.customerService
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
    this.searchPlaceholder = `Search ${status} Customers By ${filterType}...`;
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