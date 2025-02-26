import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, Input, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../_models/user';
import { decodeToken } from '../../../_helper/jwt-helper';

import { ClerkDashboardService } from '../../../_services/clerk-dashboard.service';
@Component({
  selector: 'app-processing-table',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],   templateUrl: './processing-table.component.html',
  styleUrl: './processing-table.component.css'
})
export class ProcessingTableComponent {

    validationError: string | null = null;
  
    products:any;
    orders: any = [];
    dataresponse:any;
    status: any ='pending';
    suborders : any ;
    selectedSuborder: any ;
    // ={ 
    //   sellerName:"" ,
    //   productName :"" ,
    //   productId:"",
    //   productRequestedQuantity:"",
    //   productFulfilledQuantity:"",
    //   orderStatus:"",
    //   orderTotalQty :""
    // }; 
  
    
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
  
    selectedFilter: string = 'orderId'; 
    searchQuery: string = '';
  
    showNoResults: boolean = false;
  
    lastSearchFilter: string = 'orderId';
  
    isLoading: boolean = true;
  
    sortField: 'orderId' | 'createdAt' | null = null;
    sortDirection: 'asc' | 'desc' | null = null;
  
    searchPlaceholder: string = ' Search By Name...';
  
    tokenData: any = null;
  
    activeCustomersCount: any = null; 
    inactiveCustomersCount : any = null;
  
    constructor(
      public dialog: MatDialog,
      public toaster: ToastrService,
  
      private clerkDashboardService: ClerkDashboardService
    ) {}
  
  
  
    ngOnInit(): void {
     
      const token = localStorage.getItem('token');
      if (token) {
        this.tokenData = decodeToken(token);
      }
  
      this.fetchOrders();
  
    }
  
  
  
    fetchOrders() {
      this.clerkDashboardService.getAllOrders(this.status).subscribe({
        next: (data) => {
          console.log(data);
          this.orders = data; 
          this.dataresponse = this.orders.subOrders;
          console.log(this.dataresponse);
          this.dropdownStates = new Array(this.dataresponse.length).fill(false);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('There was an error fetching the orders:', error);
          this.isLoading = false;
        }
      });
    }
  
  
  
    selectOrder(order: any): void {
      if (!order || !order.orderId) {
        console.error('Invalid order object or missing orderId');
        return;
      }
    
      this.selectedSuborder = {
        orderId: order.orderId, // Ensure this is set
        sellerName: order.sellerName,
        orderStatus: order.orderStatus,
        orderTotalQty: order.orderTotalQty,
        products: order.products,
      };
      console.log('Selected Suborder:', this.selectedSuborder); // Debugging
    }
  
  
  
  
  
    incrementQuantity(): void {
      if (this.selectedSuborder?.products?.length > 0) {
        const product = this.selectedSuborder.products[0];
        if (product.productFulfilledQuantity < product.productStock) {
          product.productFulfilledQuantity++;
          this.validateFulfilledQuantity();
        }
      }
    }
  
    // Method to decrement the fulfilled quantity
    decrementQuantity(): void {
      if (this.selectedSuborder?.products?.length > 0) {
        const product = this.selectedSuborder.products[0];
        if (product.productFulfilledQuantity > 0) {
          product.productFulfilledQuantity--;
          this.validateFulfilledQuantity();
        }
      }
    }
  
    // Method to validate the fulfilled quantity
    validateFulfilledQuantity(): boolean {
      if (this.selectedSuborder?.products?.length > 0) {
        const product = this.selectedSuborder.products[0];
        if (product.productFulfilledQuantity > product.productStock) {
          this.validationError = `Fulfilled quantity cannot exceed available stock (${product.productStock}).`;
          return false;
        }
      }
      this.validationError = null; // Clear validation error if valid
      return true;
    }
  
  
    hideSingleSelectionIndicator = signal(true);
  
  
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
  
  
    updateUserActivity(_id: string, isActive: boolean): void {
      const user = this.users.find((u) => u._id === _id);
      if (user) {
        user.isActive = isActive;
      }
    }
  
  
  
    toggleEdit(event?: any): void {
      console.log('Selected Suborder before editing:', this.selectedSuborder); // Debugging
    
      if (this.editing) {
        console.log('Selected Suborder:', this.selectedSuborder); // Debugging
    
        if (!this.selectedSuborder?.orderId) {
          console.error('Order ID is undefined or invalid.');
          return;
        }
    
        // Validate the fulfilled quantity before proceeding
        if (!this.validateFulfilledQuantity()) {
          this.toaster.error('Fulfilled quantity cannot exceed available stock.', 'Validation Error');
          return; // Stop if validation fails
        }
    
        // Backup current state before editing
        const workingBackup = {
          status: this.selectedSuborder.orderStatus,
          fulfilledQuantity: this.selectedSuborder.products[0].productFulfilledQuantity,
        };
    
        // Attempt to update the suborder
        const sub = this.clerkDashboardService
          .updateSuborder(this.selectedSuborder.orderId, {
            orderStatus: this.selectedSuborder.orderStatus,
            productFulfilledQuantity: this.selectedSuborder.products[0].productFulfilledQuantity,
          })
          .subscribe({
            next: (res: any) => {
              if (res.message === 'success') {
                // Successfully updated, sync the UI with the server response
                this.selectedSuborder = { ...this.selectedSuborder, ...res.updatedSuborder };
                this.toaster.success('Order updated successfully!', 'Success');
              } else {
                // If update failed, restore the backup
                this.selectedSuborder.orderStatus = workingBackup.status;
                this.selectedSuborder.products[0].productFulfilledQuantity = workingBackup.fulfilledQuantity;
                this.toaster.error('Failed to update order.', 'Error');
              }
              this.editing = false;
            },
            error: (error) => {
              // Handle error, show error message, restore backup
              console.error('Error updating suborder', error);
              this.selectedSuborder.orderStatus = workingBackup.status;
              this.selectedSuborder.products[0].productFulfilledQuantity = workingBackup.fulfilledQuantity;
              this.toaster.error('An error occurred while updating the order.', 'Error');
              this.editing = false;
            },
          });
    
        this.subscriptions.push(sub); // Track the subscription
      } else {
        // Enable editing
        this.editing = true;
      }
    
      if (event && event.target) event.target.blur(); // Remove focus from the button
    }
    
  
   
  
  
  
  
   
    
  
   
    validateSearchInput(event: KeyboardEvent): boolean {
      const pattern =
        this.selectedFilter === 'orderId'
          ? /^[a-zA-Z\s]$/ // Only letters and spaces for orderIds
          : /^[0-9]$/; // Only numbers for SSN and phone
  
      if (!pattern.test(event.key)) {
        event.preventDefault();
        return false;
      }
      return true;
    }
  
  
  
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
  }
  



