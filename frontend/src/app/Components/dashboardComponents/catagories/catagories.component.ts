import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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
import { category } from '../../../_models/category2';

declare var $: any;

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
  
    categories: category[] = [];
    isDarkMode: boolean = false;
    dropdownStates: boolean[] = [];
    editing: boolean = false;
  
    subscriptions: Subscription[] = [];
  
    pageCache: { [key: string]: { result: category[]; total: number } } = {};
  
    selectedFilter: string = 'name';
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
      private categoryService: CategoryService,
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
  
    loadSellers(): void {
      const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}`;
  
      if (this.pageCache[cacheKey]) {
        const cached = this.pageCache[cacheKey];
        this.categories = cached.result;
        this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
        this.dropdownStates = new Array(this.categories.length).fill(false);
        this.updatePaginationState();
        this.showNoResults = false;
        this.isLoading = false;
        return;
      }
  
      this.isLoading = true;
      this.categories = [];
  
      let filterParam = '';
      if (this.currentFilter === 'active') {
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
  
      const obs = this.categoryService.getPaginatedCategories(
        this.currentPage,
        this.itemsPerPage,
        filterParam,
        sortParam
      );
  
      const sub = obs.subscribe({
        next: (res) => {
          this.categories = res.data.results;
          this.showNoResults = false;
          const total = res.data.total;
          this.totalPages = Math.ceil(total / this.itemsPerPage);
          this.dropdownStates = new Array(this.categories.length).fill(false);
          this.pageCache[cacheKey] = { result: this.categories, total: total };
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
  
    // Customer actions
    deActiveCustomer(_id: string): void {
      const sub = this.categoryService.deactivateCategory(_id).subscribe({
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
      const sub = this.categoryService.activateCategory(_id).subscribe({
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
  
    updateCategoryActivity(categoryId: string, isActive: boolean): void {
      const category = this.categories.find((c: category) => c._id === categoryId);
      if (category) {
          category.isActive = isActive;
      }
    }
  
    getActiveCustomersCount(): void {
      const sub = this.categoryService.getActiveCategoriesCount().subscribe({
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
      const sub = this.categoryService.getInactiveCategoriesCount().subscribe({
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
      this.categories = [];
  
      let searchFilter = `Cname:${this.searchQuery}`;
      const statusFilter =
        this.currentFilter === 'active'
          ? '+isActive:true'
          : this.currentFilter === 'inactive'
          ? '+isActive:false'
          : '';
  
      const filters = searchFilter + statusFilter;
  
      let sortParam = '';
      if (this.sortField && this.sortDirection) {
        sortParam = `&sort=${
          this.sortField === 'name' ? 'name' : this.sortField
        }:${this.sortDirection}`;
      }
  
      const sub = this.categoryService
        .searchCategories(filters, this.currentPage, this.itemsPerPage, sortParam)
        .subscribe({
          next: (res) => {
            if (res.data) {
              this.categories = res.data.results;
              this.showNoResults = this.categories.length === 0;
              this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
              this.dropdownStates = new Array(this.categories.length).fill(false);
              this.updatePaginationState();
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error searching sellers:', error);
            this.categories = [];
            this.showNoResults = true;
            this.updatePaginationState();
            this.isLoading = false;
          },
        });
  
      this.subscriptions.push(sub);
    }
  
    updateSearchPlaceholder() {
      const status = this.currentFilter === 'active' 
          ? 'Active' 
          : this.currentFilter === 'inactive' 
          ? 'Inactive' 
          : 'All';
      this.searchPlaceholder = `Search ${status} Categories by Name...`;
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
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
