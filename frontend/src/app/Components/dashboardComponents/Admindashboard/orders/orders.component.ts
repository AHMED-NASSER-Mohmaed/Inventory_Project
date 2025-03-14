import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../../../_services/admin-dash-orders.service';
import { decodeToken } from '../../../../_helper/jwt-helper';
import { AdminDashOrdersService } from '../../../../_services/admin-dash-orders.service';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  currentFilter: string = 'offline';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  orders: Order[] = [];
  allOrders: Order[] = [];
  onlineOrders: Order[] = [];
  offlineOrders: Order[] = [];

  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedOrder: Order | null = null;

  subscriptions: Subscription[] = [];

  selectedFilter: string = 'customerName';
  searchQuery: string = '';

  showNoResults: boolean = false;

  lastSearchFilter: string = 'customerName';

  isLoading: boolean = true;

  sortField: 'customerName' | 'createdAt' | 'orderStatus' | 'orderTotalPrice' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  searchPlaceholder: string = 'Search By Customer Name...';

  tokenData: any = null;

  onlineOrdersCount: number = 0;
  offlineOrdersCount: number = 0;
  
  isOnlineAdmin: boolean = false;

  constructor(
    private admindashOrdersService: AdminDashOrdersService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.updateSearchPlaceholder();
    
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
      this.isOnlineAdmin = this.tokenData?.id?.branch === 10;
      
      if (this.isOnlineAdmin) {
        this.currentFilter = 'online';
      }
    }
    
    this.loadOrders(this.currentFilter);
  }

  hideSingleSelectionIndicator = signal(true);

  loadOrders(filter: string): void {
    this.isLoading = true;
    this.orders = [];

    if (this.isOnlineAdmin) {
      const onlineSub = this.admindashOrdersService.getOnlineOrders().subscribe({
        next: (onlineRes) => {
          this.onlineOrders = onlineRes.subOrders || [];
          this.onlineOrdersCount = this.onlineOrders.length;
          this.allOrders = [...this.onlineOrders];
          
          this.processOrders(this.onlineOrders);
        },
        error: this.handleError.bind(this)
      });
      this.subscriptions.push(onlineSub);
    } else {
      const offlineSub = this.admindashOrdersService.getOfflineOrders().subscribe({
        next: (res) => {
          console.log(res)
          for(let i = 0; i < res.allOfflineSuborders.length; i++){
            res.allOfflineSuborders[i].customerName = res.allOfflineSuborders[i].phone1;
          }
          this.offlineOrders = res.allOfflineSuborders || [];
          console.log(`offlineOrders${ this.offlineOrders}`)
          this.offlineOrdersCount = this.offlineOrders.length;
          this.allOrders = [...this.offlineOrders];
          console.log(this.allOrders)
          
          this.processOrders(this.offlineOrders);
        },
        error: this.handleError.bind(this)
      });
      this.subscriptions.push(offlineSub);
    }
  }

  isOnlineOrder(order: Order): boolean {
    if (this.isOnlineAdmin) return true;
    
    return false;
  }

  isOfflineOrder(order: Order): boolean {
    if (this.isOnlineAdmin) return false;
    
    return true;
  }

  getOrderType(order: Order): string {
    return this.isOnlineOrder(order) ? 'Online' : 'In-Store';
  }

  processOrders(orders: Order[]): void {
    const filteredOrders = this.isSearchMode ?
      this.filterOrders(orders, this.selectedFilter, this.searchQuery) :
      orders;

    const sortedOrders = this.sortOrders(filteredOrders);

    this.totalPages = Math.ceil(sortedOrders.length / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.orders = sortedOrders.slice(startIndex, endIndex);

    this.dropdownStates = new Array(this.orders.length).fill(false);
    this.updatePaginationState();
    this.showNoResults = filteredOrders.length === 0;
    this.isLoading = false;
  }

  handleError(error: any): void {
    console.error('Error fetching orders:', error);
    this.toaster.clear();
    this.toaster.error(error.error?.message || 'Failed to load orders', 'Failed', {
      timeOut: 1500,
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true
    });
    this.isLoading = false;
  }

  filterOrders(orders: Order[], filterBy: string, query: string): Order[] {
    if (!query.trim()) return orders;

    query = query.toLowerCase();

    return orders.filter(order => {
      switch(filterBy) {
        case 'customerName':
          return order.customerName.toLowerCase().includes(query);
        case 'orderStatus':
          return order.orderStatus.toLowerCase().includes(query);
        case 'orderId':
          return order.orderId.toLowerCase().includes(query);
        default:
          return true;
      }
    });
  }

  sortOrders(orders: Order[]): Order[] {
    if (!this.sortField || !this.sortDirection) return orders;

    return [...orders].sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'orderStatus':
          comparison = a.orderStatus.localeCompare(b.orderStatus);
          break;
        case 'orderTotalPrice':
          comparison = a.orderTotalPrice - b.orderTotalPrice;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.refreshCurrentView();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.refreshCurrentView();
    }
  }

  refreshCurrentView(): void {
    if (this.isOnlineAdmin) {
      this.processOrders(this.onlineOrders);
    } else {
      this.processOrders(this.offlineOrders);
    }
  }

  setFilter(filter: string): void {
    // For branch 10, only allow 'online' filter
    if (this.isOnlineAdmin) {
      this.currentFilter = 'online';
    } else {
      this.currentFilter = filter === 'offline' ? 'offline' : '';
    }
    
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.showNoResults = false;

    this.updateSearchPlaceholder();
    this.loadOrders(this.currentFilter);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
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
      this.refreshCurrentView();
      return;
    }

    this.isSearchMode = true;
    this.currentPage = 1;

    this.refreshCurrentView();
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.isSearchMode = false;
    this.currentFilter = '';
    this.currentPage = 1;
    this.sortField = null;
    this.sortDirection = null;
    this.loadOrders('');
    this.updateSearchPlaceholder();
  }

  validateSearchInput(event: KeyboardEvent): boolean {
    return true;
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    this.searchQuery = pastedText;
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.value;
    this.searchQuery = '';
    this.updateSearchPlaceholder();
  }

  updateSearchPlaceholder() {
    const filterType =
      this.selectedFilter === 'orderStatus'
        ? 'Order Status'
        : this.selectedFilter === 'orderId'
        ? 'Order ID'
        : 'Customer Name';
    
    const status = this.isOnlineAdmin ? 'Online' : 'Offline';
    this.searchPlaceholder = `Search ${status} Orders By ${filterType}...`;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.refreshCurrentView();
  }

  toggleSort(field: 'customerName' | 'createdAt' | 'orderStatus' | 'orderTotalPrice'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
    this.refreshCurrentView();
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'pending': return 'pending';
      case 'partially delivered': return 'partial';
      case 'delivered': return 'completed';
      case 'shipped': return 'process';
      case 'processing': return 'process';
      default: return 'process';
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
