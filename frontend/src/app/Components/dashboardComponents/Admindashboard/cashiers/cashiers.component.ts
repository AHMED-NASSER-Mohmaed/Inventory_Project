import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../_models/user';
import { CashiersService } from '../../../../_services/cashiers.service';
import { decodeToken } from '../../../../_helper/jwt-helper';
import { ConfirmDialogComponent2 } from '../../../../confirm-dialog2/confirm-dialog2.component';
import { ConfirmDialogComponent } from '../../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogImgchangeComponent } from '../../../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';

@Component({
  selector: 'app-cashiers',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    MatSelectModule

  ],
  templateUrl: './cashiers.component.html',
  styleUrl: './cashiers.component.css'
})
export class CashiersComponent implements OnInit, OnDestroy{


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
      
        selectedFilter: string = 'name'; 
        searchQuery: string = '';
      
        showNoResults: boolean = false;
      
        lastSearchFilter: string = 'name';
      
        isLoading: boolean = true;
      
        sortField: 'name' | 'createdAt' | null = null;
        sortDirection: 'asc' | 'desc' | null = null;
      
        searchPlaceholder: string = ' Search By Name...';
      
        tokenData: any = null;
        BranchFromToken: any = null;
      
        activeCustomersCount: any = null; 
        inactiveCustomersCount : any = null;
        totalCashiersCount: number | null = null; 
      
        branches: { id: string, main: string, sub: string }[] = [];
      
        newAdmin: {
          firstName: string,
          lastName: string,
          email: string,
          phoneNumber: string,
          password: string,
          passwordConfirm: string,
          SSN: string,
          branchId?: string,
          image?: File
        } = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          passwordConfirm: '',
          SSN: '',
          branchId: '' 
        };
      
        selectedActivationAdmin: User = {} as User;
        selectedActivationBranch: string = '';
      
        selectedBranch: string = ''; 
      
        constructor(
          private cashierService: CashiersService,
          public dialog: MatDialog,
          public toaster: ToastrService
        ) {}
      
        ngOnInit(): void {
          const token = localStorage.getItem('token');
          if (token) {
            this.tokenData = decodeToken(token);
            this.BranchFromToken = this.tokenData.id.branch;
            this.selectedBranch = this.BranchFromToken; 
            this.newAdmin.branchId = this.BranchFromToken;
          }
          
          this.updateSearchPlaceholder();
          this.loadSellers();
          this.getInActiveCustomersCount();
          this.getActiveCustomersCount();
          // this.loadBranches();
        }
      
        hideSingleSelectionIndicator = signal(true);
      
        loadSellers(): void {
          const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedBranch}`;
      
          if (this.pageCache[cacheKey]) {
            const cached = this.pageCache[cacheKey];
            this.users = cached.result;
            this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
            this.totalCashiersCount = cached.total; // Set total count from cache
            this.dropdownStates = new Array(this.users.length).fill(false);
            this.updatePaginationState();
            this.showNoResults = false;
            this.isLoading = false;
            return;
          }
      
          this.isLoading = true;
          this.users = [];
      
          let filterParam = '';
          if (this.selectedBranch) {
            filterParam = `branch:${this.selectedBranch}+isActive:true`;
          } else if (this.currentFilter === 'active') {
            filterParam = 'isActive:true';
          } else if (this.currentFilter === 'inactive') {
            filterParam = 'isActive:false';
          }
      
          let sortParam = '';
          if (this.sortField && this.sortDirection) {
            sortParam = `&sort=${
              this.sortField === 'name' ? 'name' : this.sortField
            }:${this.sortDirection}`;
          }
      
          const obs = this.cashierService.getPaginatedCustomersByStatus(
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
              this.totalCashiersCount = total; // Store the total count
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
      
        onBranchFilterChange(): void {
          this.currentPage = 1;
          this.isSearchMode = false;
          this.searchQuery = '';
          this.currentFilter = ''; 
          this.updateSearchPlaceholder(); 
          this.loadSellers();
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
      
        showSellerInfo(user: User): void {
          this.selectedUser = {
            ...user,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            companyName: user.companyName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            SSN: user.SSN || '',
            branch: user.branch && user.branch.location ? user.branch.location : 'Not Assigned Yet'
          };
          this.backupUser = { ...this.selectedUser };
        }
      
        deActiveCustomer(_id: string): void {
          const sub = this.cashierService.deActiveCustomer(_id).subscribe({
            next: (res) => {
              console.log(res);
              this.pageCache = {};
              if(this.isSearchMode) {
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
          const sub = this.cashierService.activateCustomer(_id).subscribe({
            next: (res) => {
              console.log(res);
              this.pageCache = {};
              if(this.isSearchMode) {
                this.loadSearchResults();
              } else {
                this.loadSellers();
              }
              // Also update counters
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
      
        openActivateAdminModal(admin: User): void {
          this.selectedActivationAdmin = admin;
          this.selectedActivationBranch = '';
        }
      
        activateAdminAssignment(): void {
          if (!this.selectedActivationBranch) {
            this.toaster.error('Please select a branch', 'Validation Error', { timeOut: 1500 });
            return;
          }
          const sub = this.cashierService.activateCustomerWithBranch(this.selectedActivationAdmin._id, this.selectedActivationBranch)
            .subscribe({
              next: (res) => {
                this.toaster.success('Admin activated successfully');
                this.pageCache = {};
                if(this.isSearchMode) {
                  this.loadSearchResults();
                } else {
                  this.loadSellers();
                }
                this.getActiveCustomersCount();
      
                const modal = document.getElementById('activateAdminModal');
                if (modal) {
                  modal.classList.remove('show');
                  modal.setAttribute('style', 'display:none;');
                }
                const backdrops = document.getElementsByClassName('modal-backdrop');
                while (backdrops.length > 0) {
                  backdrops[0].parentNode?.removeChild(backdrops[0]);
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
          const sub = this.cashierService.getActiveCustomersCount().subscribe({
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
          const sub = this.cashierService.getInActiveCustomersCount().subscribe({
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
            const updatePayload = {
              SSN: this.selectedUser.SSN,
              firstName: this.selectedUser.firstName,
              lastName: this.selectedUser.lastName,
              phoneNumber: this.selectedUser.phoneNumber,
              email: this.selectedUser.email
            };
            const sub = this.cashierService.updateCustomer(this.selectedUser._id, updatePayload)
              .subscribe({
                next: (res: any) => {
                  if (res.message === 'success') {
                    const index = this.users.findIndex((u) => u.SSN === this.selectedUser.SSN);
                    if (index !== -1) {
                      this.users[index] = { ...this.selectedUser };
                      this.backupUser = { ...this.selectedUser };
                    }
                  } else {
                    const index = this.users.findIndex((u) => u.SSN === workingBackup.SSN);
                    if (index !== -1) {
                      this.users[index] = workingBackup;
                      this.selectedUser = workingBackup;
                    }
                  }
                  this.editing = false;
                },
                error: (error) => {
                  this.toaster.clear();
                  console.log("cashier update, branch:", this.selectedUser.branch);
                  this.toaster.error(error.error.message, 'Failed', {
                    timeOut: 1500,
                    positionClass: 'toast-bottom-right',
                    progressBar: true,
                    closeButton: true
                  });
                  console.error('Error updating cashier info', error);
                  const index = this.users.findIndex((u) => u.SSN === workingBackup.SSN);
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
                    const response: any = await this.cashierService
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
      
          this.isSearchMode = true;
          this.currentPage = 1;
          this.loadSearchResults();
        }
      
        resetSearch(): void {
          this.searchQuery = '';
          this.isSearchMode = false;
          this.currentFilter = ''; 
          this.currentPage = 1;
          this.sortField = null;
          this.sortDirection = null;
          this.selectedBranch = '';
          this.loadSellers();
          this.updateSearchPlaceholder();
        }
      
        validateSearchInput(event: KeyboardEvent): boolean {
          const pattern =
            this.selectedFilter === 'name'
              ? /^[a-zA-Z\s]$/ 
              : /^[0-9]$/; 
      
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
              ? /^[a-zA-Z\s]*$/ 
              : /^[0-9]*$/; 
      
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
      
          if (this.selectedBranch) {
            filters = `${searchFilter}+branch:${this.selectedBranch}+isActive:true`;
          } else {
            const statusFilter =
              this.currentFilter === 'active'
                ? '+isActive:true'
                : this.currentFilter === 'inactive'
                ? '+isActive:false'
                : '';
            filters = searchFilter + statusFilter;
          }
      
          let sortParam = '';
          if (this.sortField && this.sortDirection) {
            sortParam = `&sort=${
              this.sortField === 'name' ? 'name' : this.sortField
            }:${this.sortDirection}`;
          }
      
          const sub = this.cashierService
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
          if (this.selectedBranch) {
            const branchObj = this.branches.find(b => b.id === this.selectedBranch);
            const branchName = branchObj ? `${branchObj.main} ${branchObj.sub}` : '';
            this.searchPlaceholder = `Search Cashiers in ${branchName} by ${filterType}...`;
          } else {
            const status =
              this.currentFilter === 'active'
                ? 'Active'
                : this.currentFilter === 'inactive'
                ? 'Inactive'
                : 'All';
            this.searchPlaceholder = `Search ${status} Cashiers By ${filterType}...`;
          }
        }
      
        onItemsPerPageChange(): void {
          this.currentPage = 1; 
          this.pageCache = {};
          if (this.isSearchMode) {
            this.loadSearchResults();
          } else {
            this.loadSellers();
          }
        }
      
        toggleSort(field: 'name' | 'createdAt'): void {
          if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortField = field;
            this.sortDirection = 'asc';
          }
      
          this.currentPage = 1;
      
          if (this.isSearchMode) {
            this.loadSearchResults();
          } else {
            this.loadSellers();
          }
        }
      
        openAddModal(): void {
          this.newAdmin = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            passwordConfirm: '',
            SSN: '',
            branchId: this.BranchFromToken || ''
          };
          console.log("openAddModal branchId:", this.newAdmin.branchId);
        }
      
        onImageSelected(event: any): void {
          const file = event.target.files[0];
          if (file) {
            this.newAdmin.image = file;
          }
        }
      
        addAdmin(): void {
          if (this.newAdmin.password !== this.newAdmin.passwordConfirm) {
            this.toaster.error('Passwords do not match', 'Validation Error', {
              timeOut: 1500,
              positionClass: 'toast-bottom-right',
              progressBar: true,
              closeButton: true
            });
            return;
          }
          
          if (!this.newAdmin.branchId && this.BranchFromToken) {
            this.newAdmin.branchId = this.BranchFromToken;
          }
          
          console.log("Adding admin with branchId:", this.newAdmin.branchId);
          
          const payload = {
            firstName: this.newAdmin.firstName,
            lastName: this.newAdmin.lastName,
            email: this.newAdmin.email,
            phoneNumber: this.newAdmin.phoneNumber,
            password: this.newAdmin.password,
            passwordConfirm: this.newAdmin.passwordConfirm,
            SSN: this.newAdmin.SSN,
            branch: this.newAdmin.branchId 
          };
          
          console.log("Payload to send:", payload);
          
          const sub = this.cashierService.addAdmin(payload).subscribe({
            next: (res) => {
              const newAdminRecord = res.data;
              if (this.newAdmin.branchId) {
                const branchObj = this.branches.find(b => b.id === this.newAdmin.branchId);
                if (branchObj) {
                  newAdminRecord.branch = { location: branchObj.main + ' ' + branchObj.sub };
                }
              }
              this.toaster.success('Cashier added successfully');
              if (!this.isSearchMode && (this.currentFilter === 'active' || this.currentFilter === '')) {
                this.users.unshift(newAdminRecord);
                const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}`;
                if (this.pageCache[cacheKey]) {
                  this.pageCache[cacheKey].result.unshift(newAdminRecord);
                  this.pageCache[cacheKey].total++;
                }
              }
              this.getActiveCustomersCount();
             
              const modalElement = document.getElementById('addCategoryModal');
              if (modalElement) {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
              }
              const backdrops = document.getElementsByClassName('modal-backdrop');
              while (backdrops.length > 0) {
                backdrops[0].parentNode?.removeChild(backdrops[0]);
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
            }
          });
          this.subscriptions.push(sub);
        }
      
        loadBranches(): void {
          this.cashierService.getMappedBranches().subscribe({
            next: (res) => {
              if (res.message === 'success' && res.data) {
                this.branches = Object.keys(res.data).map(id => {
                  const location: string = res.data[id].location;
                  const parts = location.split('-').map(s => s.trim());
                  return { id, main: parts[0], sub: parts[1] || '' };
                });
                this.updateSearchPlaceholder(); 
              }
            },
            error: (error) => {
              this.toaster.error('Failed to load branches', 'Error', {
                timeOut: 1500,
                positionClass: 'toast-bottom-right',
                progressBar: true,
                closeButton: true
              });
            }
          });
        }
      
        closeActivateModal(): void {
          ($('#activateAdminModal') as any).modal('hide');
        }
      
        ngOnDestroy(): void {
          this.subscriptions.forEach((sub) => sub.unsubscribe());
        }

}
