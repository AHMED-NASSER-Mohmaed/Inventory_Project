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


import { SellerPendingOrdersServiceService } from '../../../../../_services/seller-pending-orders-service.service';
import { decodeToken } from '../../../../../_helper/jwt-helper';
import { User } from '../../../../../_models/user';

@Component({
  selector: 'app-completed-table',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
  ],   templateUrl: './completed-table.component.html',
  styleUrl: './completed-table.component.css'
})
export class CompletedTableComponent implements OnInit, OnDestroy{

    validationError: string | null = null;
  
    products:any;
    orders: any = [];
    dataresponse:any;
    status: any ='Processing';
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
  
     private sellerOrderService: SellerPendingOrdersServiceService
    ) {}



    ngOnInit(): void {
      const token = localStorage.getItem('token');
      if (token) {
        this.tokenData = decodeToken(token);
      }
    
      this.status = 'completed'; 
      this.fetchOrders(this.status); 
      console.log(this.fetchOrders)
      console.log(this.status)
    }
    
    fetchOrders(status: string) {
      this.isLoading = true;
      this.sellerOrderService.getAllOrders('completed').subscribe({
        next: (data) => {
          console.log('Fetched orders:', data);
          this.orders = data;
          this.dataresponse = this.orders.subOrders; 

          this.updatePagination(); 
          console.log('Processed data response:', this.dataresponse);
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
        orderId: order.orderId, 
        sellerName: order.sellerName,
        orderStatus: order.orderStatus,
        orderTotalQty: order.orderTotalQty,
        products: order.products,
      };
      console.log('Selected Suborder:', this.selectedSuborder); 
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
  
    decrementQuantity(): void {
      if (this.selectedSuborder?.products?.length > 0) {
        const product = this.selectedSuborder.products[0];
        if (product.productFulfilledQuantity > 0) {
          product.productFulfilledQuantity--;
          this.validateFulfilledQuantity();
        }
      }
    }
  
    validateFulfilledQuantity(): boolean {
      if (this.selectedSuborder?.products?.length > 0) {
        const product = this.selectedSuborder.products[0];
        if (product.productFulfilledQuantity > product.productStock) {
          this.validationError = `Fulfilled quantity cannot exceed available stock (${product.productStock}).`;
          return false;
        }
      }
      this.validationError = null;
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
      console.log('Selected Suborder before editing:', this.selectedSuborder); 
    
      if (this.editing) {
        console.log('Selected Suborder:', this.selectedSuborder); 
    
        if (!this.selectedSuborder?.orderId) {
          console.error('Order ID is undefined or invalid.');
          return;
        }
    
        if (!this.validateFulfilledQuantity()) {
          this.toaster.error('Fulfilled quantity cannot exceed available stock.', 'Validation Error');
          return; 
        }
    
        if (!this.selectedSuborder.products?.length) {
          console.error('Products array is missing or empty.');
          this.toaster.error('No products found in this suborder.', 'Error');
          return;
        }
    
        const newStatus = this.selectedSuborder.orderStatus ?? 'PENDING';
    
        const fulfilledQuantities: { [key: string]: number } = {};
    
        this.selectedSuborder.products.forEach((product:any) => {
          if (product.productId && product.productFulfilledQuantity !== undefined) {
            fulfilledQuantities[product.productId] = product.productFulfilledQuantity;
          }
        });
    
        const workingBackup = {
          status: newStatus, 
          fulfilledQuantities: { ...fulfilledQuantities }, 
        };
    
        // const sub = this.sellerOrderService
        // .updateSuborder(this.selectedSuborder.orderId)
        //   .subscribe({
        //     next: (res: any) => {
        //       if (res.message === 'success') {
        //         this.selectedSuborder = { ...this.selectedSuborder, ...res.updatedSuborder };
        //         this.toaster.success('Order updated successfully!', 'Success');
        //       } else {
        //         this.selectedSuborder.orderStatus = workingBackup.status;
        //         this.selectedSuborder.products.forEach((product:any) => {
        //           if (product.productId in workingBackup.fulfilledQuantities) {
        //             product.productFulfilledQuantity = workingBackup.fulfilledQuantities[product.productId];
        //           }
        //         });
        //         this.toaster.error('Failed to update order.', 'Error');
        //       }
        //       this.editing = false;
        //     },
        //     error: (error) => {
        //       console.error('Error updating suborder', error);
        //       this.selectedSuborder.orderStatus = workingBackup.status;
        //       this.selectedSuborder.products.forEach((product:any) => {
        //         if (product.productId in workingBackup.fulfilledQuantities) {
        //           product.productFulfilledQuantity = workingBackup.fulfilledQuantities[product.productId];
        //         }
        //       });
        //       this.toaster.error('An error occurred while updating the order.', 'Error');
        //       this.editing = false;
        //     },
        //   });
    
        // this.subscriptions.push(sub); 
      } else {
        this.editing = true;
      }
    
      if (event?.target) event.target.blur();
    }
  
   
  
  
  
  
   
    
  
   
    validateSearchInput(event: KeyboardEvent): boolean {
      const pattern =
        this.selectedFilter === 'orderId'
          ? /^[a-zA-Z\s]$/ 
          : /^[0-9]$/; 
  
      if (!pattern.test(event.key)) {
        event.preventDefault();
        return false;
      }
      return true;
    }
  
  
  
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

        // Pagination Variables
         // Pagination Variables
    currentPage: number = 1;
    itemsPerPage: number = 5;
    totalPages: number = 1;
  
     // Pagination Logic
     get paginatedOrders(): any[] {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.dataresponse?.slice(startIndex, endIndex);
    }
  
    updatePagination(): void {
      if (!this.dataresponse || this.dataresponse.length === 0) {
        this.totalPages = 1;
      } else {
        this.totalPages = Math.ceil(this.dataresponse.length / this.itemsPerPage);
      }
    }
    
  
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  
    prevPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }

