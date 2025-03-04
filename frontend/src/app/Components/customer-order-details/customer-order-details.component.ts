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
import { Order } from '../../_services/customer-order-details.service';
import { decodeToken } from '../../_helper/jwt-helper';
import { CustomerOrderDetailsService } from '../../_services/customer-order-details.service';
import { ConfirmDialogComponent2 } from '../../confirm-dialog2/confirm-dialog2.component';

declare var bootstrap: any; 

@Component({
  selector: 'app-customer-order-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './customer-order-details.component.html',
  styleUrl: './customer-order-details.component.css'
})

export class CustomerOrderDetailsComponent implements OnInit, OnDestroy {
  allOrders: Order[] = [];
  
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading: boolean = true;
  subscriptions: Subscription[] = [];
  tokenData: any = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 6; 
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  
  constructor(
    private customerOrderDetails: CustomerOrderDetailsService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCustomerOrders();
    
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
  }
  
  loadCustomerOrders(): void {
    this.isLoading = true;
    
    const sub = this.customerOrderDetails.getCustomerOrders().subscribe({
      next: (res) => {
        this.allOrders = res;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching customer orders:', error);
        this.toaster.error('Failed to load your orders', 'Error');
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.allOrders.length / this.itemsPerPage);
    this.loadOrdersForCurrentPage();
    this.updatePaginationState();
  }

  loadOrdersForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allOrders.length);
    this.orders = this.allOrders.slice(startIndex, endIndex);
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadOrdersForCurrentPage();
      this.updatePaginationState();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.loadOrdersForCurrentPage();
      this.updatePaginationState();
    }
  }
  
  showOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
    
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  
  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'completed': 
      case 'delivered': 
        return 'completed';
      case 'cancelled': return 'cancelled';
      case 'pending': return 'pending';
      case 'partially delivered': return 'partial';
      default: return 'process';
    }
  }
  
  formatPrice(price: number): string {
    if (!price) return '$0.00';
    return price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    });
  }

  getProductSubtotal(product: any): number {
    if (product.productPrice) {
      return product.productPrice * product.productFulfilledQuantity;
    } else if (this.selectedOrder && this.selectedOrder.orderTotalQty > 0) {
      return (this.selectedOrder.orderTotalPrice / this.selectedOrder.orderTotalQty) * product.productFulfilledQuantity;
    }
    return 0;
  }
  
  cancelOrder(orderId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2, {
      width: '350px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true;
        const sub = this.customerOrderDetails.cancelOrder(orderId).subscribe({
          next: (res) => {
            this.toaster.success('Order cancelled successfully');
            this.loadCustomerOrders(); 
          },
          error: (error) => {
            console.error('Error cancelling order:', error);
            this.toaster.error('Failed to cancel order', 'Error');
            this.isLoading = false;
          }
        });
        
        this.subscriptions.push(sub);
      }
    });
  }

  cancelProduct(orderId: string, productId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2, {
      width: '350px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true;
        const sub = this.customerOrderDetails.cancelProductsFromOrder(orderId, [productId]).subscribe({
          next: (res) => {
            console.log(res)
            this.toaster.success('Product removed from order successfully');
            this.refreshOrderDetails(orderId);
          },
          error: (error) => {
            console.error('Error removing product from order:', error);
            this.toaster.error('Failed to remove product from order', 'Error');
            this.isLoading = false;
          }
        });
        
        this.subscriptions.push(sub);
      }
    });
  }

  refreshOrderDetails(orderId: string): void {
    this.isLoading = true;
    const sub = this.customerOrderDetails.getCustomerOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        
        const updatedOrder = orders.find(order => order.orderId === orderId);
        if (updatedOrder) {
          const oldTotalQty = this.selectedOrder?.orderTotalQty || 0;
          const oldTotalPrice = this.selectedOrder?.orderTotalPrice || 0;
          
          this.selectedOrder = { ...updatedOrder };
          
          const index = this.orders.findIndex(o => o.orderId === orderId);
          if (index !== -1) {
            this.orders[index] = { ...updatedOrder };
            
            if (updatedOrder.orderStatus.toLowerCase() === 'cancelled') {
              this.toaster.info('All products have been cancelled. Order is now cancelled.');
            } else {
              const priceDiff = oldTotalPrice - updatedOrder.orderTotalPrice;
              const itemsDiff = oldTotalQty - updatedOrder.orderTotalQty;
              
              if (priceDiff > 0 || itemsDiff > 0) {
                this.toaster.info(`Order updated: ${itemsDiff} item(s) and ${this.formatPrice(priceDiff)} removed`);
                
                setTimeout(() => {
                  this.highlightTotals();
                }, 300);
              }
            }
          }
        }
        
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error refreshing order details:', error);
        this.toaster.error('Failed to refresh order details', 'Error');
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  highlightTotals(): void {
    const totalPriceElement = document.querySelector('.summary-row.total .summary-value');
    const totalItemsElement = document.querySelector('.summary-row:not(.total) .summary-value');
    
    if (totalPriceElement) {
      totalPriceElement.classList.add('highlight-change');
      setTimeout(() => totalPriceElement.classList.remove('highlight-change'), 2000);
    }
    
    if (totalItemsElement) {
      totalItemsElement.classList.add('highlight-change');
      setTimeout(() => totalItemsElement.classList.remove('highlight-change'), 2000);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
