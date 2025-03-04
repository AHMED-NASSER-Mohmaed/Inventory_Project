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
import { MatSelectModule } from '@angular/material/select';
import { MatTreeNestedDataSource, MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OffProduct, ProductImage } from '../../../../_models/offproduct';
import { OffproductService } from '../../../../_services/offproduct.service';
import { decodeToken } from '../../../../_helper/jwt-helper';
import { ConfirmDialogComponent } from '../../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../../confirm-dialog2/confirm-dialog2.component';

interface FilterNode {
  name: string;
  type?: string;
  id?: string;
  value?: string;
  children?: FilterNode[];
}

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    MatSelectModule,
    MatTreeModule,
    MatCheckboxModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy{


  currentFilter: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;
    hasNextPage: boolean = false;
    hasPreviousPage: boolean = false;
  
    products: OffProduct[] = [];
    isDarkMode: boolean = false;
    dropdownStates: boolean[] = [];
    selectedProduct: any = {};
    backupProduct: any = {};
    editing: boolean = false;
    BranchFromToken: any = null;
  
    subscriptions: Subscription[] = [];
  
    pageCache: { [key: string]: { result: OffProduct[]; total: number } } = {};
  
    selectedFilter: string = 'name'; 
    searchQuery: string = '';
  
    showNoResults: boolean = false;
  
    lastSearchFilter: string = 'name';
  
    isLoading: boolean = true;
  
    sortField: 'createdAt' | 'price' | null = null;
    sortDirection: 'asc' | 'desc' | null = null;
  
    searchPlaceholder: string = ' Search By Name...';
  
    tokenData: any = null;
  
    activeProductsCount: any = null;
    inactiveProductsCount: any = null;
  
    branches: { id: string; main: string; sub: string }[] = [];
    categories: { _id: string; Cname: string }[] = [];
    brands: { _id: string; Bname: string }[] = [];
    suppliers: { _id: string; companyName: string }[] = [];
  
    selectedBranch: string = '';
    selectedCategory: string = '';
    selectedBrand: string = '';
  
    newProduct: {
      name: string;
      code: string;
      description: string;
      cost: number;
      category: string;
      brand: string;
      supplier: string;
      stock: number;
    } = {
      name: '',
      code: '',
      description: '',
      cost: 0,
      category: '',
      brand: '',
      supplier: '',
      stock: 0
    };
  
    selectedImageIds: string[] = [];
    newImages: File[] = [];
  
    stockUpdateQuantity: number = 0;
    exportDestinationBranch: string = '';
    exportQuantity: number = 0;
  
    treeControl = new NestedTreeControl<FilterNode>(node => node.children);
    filterDataSource = new MatTreeNestedDataSource<FilterNode>();
    filterNodes: FilterNode[] = [
      {
        name: 'Branch',
        children: []
      },
      {
        name: 'Category',
        children: []
      },
      {
        name: 'Brand',
        children: []
      }
    ];
  
    constructor(
      private offproductService: OffproductService,
      public dialog: MatDialog,
      public toaster: ToastrService
    ) {}
  
    ngOnInit(): void {
      // First get token data and set branch
      const token = localStorage.getItem('token');
      if (token) {
        this.tokenData = decodeToken(token);
        this.BranchFromToken = this.tokenData.id.branch;
        this.selectedBranch = this.BranchFromToken;
        console.log('Branch from token:', this.BranchFromToken);
      }
      
      this.updateSearchPlaceholder();
      this.loadProducts();
      this.getInActiveProductsCount();
      this.getActiveProductsCount();
      // this.loadBranches();
      this.loadCategories();
      this.loadBrands();
      this.loadSuppliers();
      
      this.filterDataSource.data = this.filterNodes;
    }
  
    hideSingleSelectionIndicator = signal(true);
  
    loadProducts(): void {
      const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedBranch}_${this.selectedCategory}_${this.selectedBrand}`;
  
      if (this.pageCache[cacheKey]) {
        const cached = this.pageCache[cacheKey];
        this.products = cached.result;
        this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
        this.dropdownStates = new Array(this.products.length).fill(false);
        this.updatePaginationState();
        this.showNoResults = false;
        this.isLoading = false;
        // Set activeProductsCount from cached total
        this.activeProductsCount = cached.total;
        return;
      }
  
      this.isLoading = true;
      this.products = [];
  
      let filterParams: string[] = [];
      
      if (this.selectedBranch) {
        filterParams.push(`branch:${this.selectedBranch}`);
      }
      if (this.selectedCategory) {
        filterParams.push(`category:${this.selectedCategory}`);
      }
      if (this.selectedBrand) {
        filterParams.push(`brand:${this.selectedBrand}`);
      }
      
      if (this.currentFilter === 'active') {
        filterParams.push('isActive:true');
      } else if (this.currentFilter === 'inactive') {
        filterParams.push('isActive:false');
      }
  
      const filterParam = filterParams.length > 0 ? filterParams.join('+') : '';
  
      let sortParam = '';
      if (this.sortField && this.sortDirection) {
        sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
      }
  
      const obs = this.offproductService.getPaginatedProducts(
        this.currentPage,
        this.itemsPerPage,
        filterParam,
        sortParam
      );
  
      const sub = obs.subscribe({
        next: (res) => {
          this.products = res.data.result;
          this.showNoResults = false;
          const total = res.data.total;
          this.totalPages = Math.ceil(total / this.itemsPerPage);
          this.dropdownStates = new Array(this.products.length).fill(false);
          this.pageCache[cacheKey] = { result: this.products, total: total };
          this.updatePaginationState();
          this.isLoading = false;
          // Set activeProductsCount directly from the API response total
          this.activeProductsCount = total;
          console.log(res);
        },
        error: (error) => {
          this.toaster.clear();
          this.toaster.error(error.error.message, 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
          console.log(error);
          this.isLoading = false;
        },
      });
      this.subscriptions.push(sub);
    }
  
    loadCategories(): void {
      const sub = this.offproductService.getAllCategories().subscribe({
        next: (res) => {
          this.categories = res.data;
          
          const categoryNode = this.filterNodes.find(node => node.name === 'Category');
          if (categoryNode) {
            categoryNode.children = this.categories.map(category => ({
              name: category.Cname,
              type: 'category',
              id: category._id,
              value: category._id
            }));
            this.filterDataSource.data = [...this.filterNodes];
          }
        },
        error: (error) => {
          this.toaster.error('Failed to load categories', 'Error');
        }
      });
      this.subscriptions.push(sub);
    }
  
    loadBrands(): void {
      const sub = this.offproductService.getAllBrands().subscribe({
        next: (res) => {
          this.brands = res.data;
          
          const brandNode = this.filterNodes.find(node => node.name === 'Brand');
          if (brandNode) {
            brandNode.children = this.brands.map(brand => ({
              name: brand.Bname,
              type: 'brand',
              id: brand._id,
              value: brand._id
            }));
            this.filterDataSource.data = [...this.filterNodes];
          }
        },
        error: (error) => {
          this.toaster.error('Failed to load brands', 'Error');
        }
      });
      this.subscriptions.push(sub);
    }
  
    loadSuppliers(): void {
      const sub = this.offproductService.getAllSuppliers().subscribe({
        next: (res) => {
          this.suppliers = res.data;
        },
        error: (error) => {
          this.toaster.error('Failed to load suppliers', 'Error');
        }
      });
      this.subscriptions.push(sub);
    }
  
    onBranchFilterChange(): void {
      this.currentPage = 1;
      this.isSearchMode = false;
      this.searchQuery = '';
      this.updateSearchPlaceholder();
      this.loadProducts();
    }
  
    onCategoryFilterChange(): void {
      this.currentPage = 1;
      this.isSearchMode = false;
      this.searchQuery = '';
      this.loadProducts();
    }
  
    onBrandFilterChange(): void {
      this.currentPage = 1;
      this.isSearchMode = false;
      this.searchQuery = '';
      this.loadProducts();
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
          this.loadProducts();
        }
      }
    }
  
    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        if (this.isSearchMode) {
          this.loadSearchResults();
        } else {
          this.loadProducts();
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
      this.loadProducts();
    }
  
    toggleDarkMode(): void {
      this.isDarkMode = !this.isDarkMode;
    }
  
    showProductInfo(product: OffProduct): void {
      this.selectedProduct = {
        _id: product._id,
        product: { ...product.product },
        branch: product.branch,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      this.backupProduct = { ...this.selectedProduct };
      this.selectedImageIds = [];
    }
  
    // Product actions
    deActivateProduct(productId: string): void {
      const sub = this.offproductService.deactivateProduct(productId).subscribe({
        next: (res) => {
          console.log(res);
          this.toaster.success('Product deactivated successfully');
          this.refreshProductData();
        },
        error: (error) => {
          this.toaster.clear();
          this.toaster.error(error.error.message || 'Failed to deactivate product', 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
          console.log(error);
        },
      });
      this.subscriptions.push(sub);
    }
  
    activateProduct(productId: string): void {
      const sub = this.offproductService.activateProduct(productId).subscribe({
        next: (res) => {
          console.log(res);
          this.toaster.success('Product activated successfully');
          this.refreshProductData();
        },
        error: (error) => {
          this.toaster.clear();
          this.toaster.error(error.error.message || 'Failed to activate product', 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
          console.log(error);
        },
      });
      this.subscriptions.push(sub);
    }
  
    openConfirmDialog(productId: string): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent);
      const sub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.deActivateProduct(productId);
        }
      });
      this.subscriptions.push(sub);
    }
  
    openConfirmDialog2(productId: string): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent2);
      const sub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.activateProduct(productId);
        }
      });
      this.subscriptions.push(sub);
    }
  
    getActiveProductsCount(): void {
      // Since we're now getting the count directly from loadProducts,
      // this method is only needed if we want to fetch the count separately
      if (this.activeProductsCount !== null && this.activeProductsCount !== undefined) {
        return; // Skip if we already have the count from loadProducts
      }
    
      const sub = this.offproductService.getActiveProductsCount().subscribe({
        next: (res) => {
          // Only update if we don't already have a value from loadProducts
          if (this.activeProductsCount === null || this.activeProductsCount === undefined) {
            this.activeProductsCount = res.data && res.data[0] ? res.data[0].total || 0 : 0;
          }
        },
        error: (error) => {
          this.toaster.clear();
          this.toaster.error(error.error.message, 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
          console.error('Error getting active products count', error);
        },
      });
      this.subscriptions.push(sub);
    }
  
    getInActiveProductsCount(): void {
      const sub = this.offproductService.getInactiveProductsCount().subscribe({
        next: (res) => {
          this.inactiveProductsCount = res.data && res.data[0] ? res.data[0].total || 0 : 0;
        },
        error: (error) => {
          this.toaster.clear();
          this.toaster.error(error.error.message, 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
          console.error('Error getting inactive products count', error);
        },
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
        const workingBackup = { ...this.backupProduct };
        const updatePayload = {
          name: this.selectedProduct.product.name,
          code: this.selectedProduct.product.code,
          description: this.selectedProduct.product.description,
          cost: this.selectedProduct.product.cost,
          category: this.selectedProduct.product.category,
          brand: this.selectedProduct.product.brand
        };
        
        const sub = this.offproductService
          .updateProductData(this.selectedProduct.product._id, updatePayload)
          .subscribe({
            next: (res: any) => {
              if (res.message === 'success') {
                this.toaster.success('Product updated successfully');
                this.backupProduct = { ...this.selectedProduct };
                
                this.refreshProductData();
              } else {
                this.selectedProduct = { ...workingBackup };
              }
              this.editing = false;
            },
            error: (error) => {
              this.toaster.clear();
              this.toaster.error(error.error.message, 'Failed', {
                timeOut: 1500,
                positionClass: 'toast-bottom-right',
                progressBar: true,
                closeButton: true,
              });
              console.error('Error updating product info', error);
              this.selectedProduct = { ...workingBackup };
              this.editing = false;
            },
          });
        this.subscriptions.push(sub);
      } else {
        this.backupProduct = { ...this.selectedProduct };
        this.editing = true;
      }
      if (event && event.target) event.target.blur();
    }
  
    deleteImageDirectly(imageId: string): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent2);
      const sub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.offproductService.deleteProductImage(this.selectedProduct.product._id, imageId).subscribe({
            next: (res) => {
              this.toaster.success('Image deleted successfully');
              
              if (this.selectedProduct && this.selectedProduct.product && this.selectedProduct.product.images) {
                this.selectedProduct.product.images = this.selectedProduct.product.images.filter(
                  (img: ProductImage) => img._id !== imageId && img.fileId !== imageId
                );
                
                const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
                if (index !== -1) {
                  this.products[index].product.images = [...this.selectedProduct.product.images];
                }
              }
            },
            error: (error) => {
              console.log(error)
              this.toaster.error(error.error?.message || 'Failed to delete image');
            }
          });
        }
      });
      this.subscriptions.push(sub);
    }
  
    deleteImage(imageId: string): void {
      if (this.selectedImageIds.includes(imageId)) {
        this.selectedImageIds = this.selectedImageIds.filter(id => id !== imageId);
      } else {
        this.selectedImageIds.push(imageId);
      }
    }
  
    onImageSelected(event: any): void {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.newImages = [...this.newImages, ...Array.from(files as FileList)];
      }
    }
  
    openFileSelector(): void {
      const fileInput = document.getElementById('newImages');
      if (fileInput) {
        fileInput.click();
      }
    }
  
    updateImages(): void {
      if (this.selectedImageIds.length === 0 && this.newImages.length === 0) {
        this.toaster.info('No images to update');
        return;
      }
  
      this.offproductService.updateProductImages(
        this.selectedProduct.product._id, 
        this.selectedImageIds, 
        this.newImages
      ).subscribe({
        next: (res) => {
          this.toaster.success('Images updated successfully');
          if (res.data && res.data.images) {
            this.selectedProduct.product.images = res.data.images;
            const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
            if (index !== -1) {
              this.products[index].product.images = res.data.images;
            }
          }
          this.selectedImageIds = [];
          this.newImages = [];
        },
        error: (error) => {
          this.toaster.error(error.error.message || 'Failed to update images');
        }
      });
    }
  
    isImageSelected(imageId: string): boolean {
      return this.selectedImageIds.includes(imageId);
    }
  
    updateStock(): void {
      if (!this.stockUpdateQuantity || this.stockUpdateQuantity <= 0) {
        this.toaster.error('Please enter a valid quantity');
        return;
      }
  
      this.offproductService.updateProductStock(
        this.selectedProduct._id, 
        this.stockUpdateQuantity
      ).subscribe({
        next: (res) => {
          this.toaster.success('Stock updated successfully');
          // Update stock in UI
          this.selectedProduct.stock += this.stockUpdateQuantity;
          const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
          if (index !== -1) {
            this.products[index].stock = this.selectedProduct.stock;
          }
          
          const modalElement = document.getElementById('stockUpdateModal');
          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
          }
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops.length > 0) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
          
          this.stockUpdateQuantity = 0;
          
          this.refreshProductData();
        },
        error: (error) => {
          console.log(error);
          this.toaster.error(error.error.message || 'Failed to update stock');
        }
      });
    }
  
    exportProduct(): void {
      if (!this.exportDestinationBranch) {
        this.toaster.error('Please select a destination branch');
        return;
      }
  
      if (!this.exportQuantity || this.exportQuantity <= 0) {
        this.toaster.error('Please enter a valid quantity');
        return;
      }
  
      if (this.exportQuantity > this.selectedProduct.stock) {
        this.toaster.error('Export quantity cannot exceed available stock');
        return;
      }
  
      this.offproductService.exportProduct(
        this.selectedProduct._id,
        this.selectedProduct.branch.toString(),
        this.exportDestinationBranch,
        this.exportQuantity
      ).subscribe({
        next: (res) => {
          this.toaster.success('Product exported successfully');
          // Update stock in UI
          this.selectedProduct.stock -= this.exportQuantity;
          const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
          if (index !== -1) {
            this.products[index].stock = this.selectedProduct.stock;
          }
          
          // Close modal with pure JavaScript
          const modalElement = document.getElementById('exportProductModal');
          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
          }
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops.length > 0) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }
          // Remove modal-open class from body
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
          
          this.exportDestinationBranch = '';
          this.exportQuantity = 0;
          
          // Refresh data
          this.refreshProductData();
        },
        error: (error) => {
          this.toaster.error(error.error.message || 'Failed to export product');
        }
      });
    }
  
    addNewProduct(): void {
      if (!this.newProduct.name || !this.newProduct.code || !this.newProduct.category ||
          !this.newProduct.brand || !this.newProduct.supplier || this.newProduct.cost <= 0 ||
          this.newProduct.stock <= 0) {
        this.toaster.error('Please fill all required fields with valid values');
        return;
      }
  
      this.offproductService.addProduct(this.newProduct).subscribe({
        next: (res) => {
          this.toaster.success('Product added successfully');
          
          const modalElement = document.getElementById('addProductModal');
          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
          }
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops.length > 0) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
          
          this.newProduct = {
            name: '',
            code: '',
            description: '',
            cost: 0,
            category: '',
            brand: '',
            supplier: '',
            stock: 0
          };
          
          this.refreshProductData();
        },
        error: (error) => {
          this.toaster.error(error.error.message || 'Failed to add product');
        }
      });
    }
  
    isSearchMode: boolean = false;
  
    onSearch(event: Event) {
      event.preventDefault();
      if (!this.searchQuery.trim()) {
        this.isSearchMode = false;
        this.loadProducts();
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
      this.selectedCategory = '';
      this.selectedBrand = '';
      this.loadProducts();
      this.updateSearchPlaceholder();
    }
  
    validateSearchInput(event: KeyboardEvent): boolean {
      if (this.selectedFilter === 'code') {
        const pattern = /^[0-9]$/;
        if (!pattern.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
          event.preventDefault();
          return false;
        }
      }
      return true;
    }
  
    handlePaste(event: ClipboardEvent): void {
      event.preventDefault();
      const pastedText = event.clipboardData?.getData('text') || '';
  
      if (this.selectedFilter === 'code') {
        const pattern = /^[0-9]*$/;
        if (pattern.test(pastedText)) {
          this.searchQuery = pastedText;
        }
      } else {
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
      this.products = [];
  
      let searchFilter = '';
      this.lastSearchFilter = this.selectedFilter;
  
      if (this.selectedFilter === 'name') {
        searchFilter = `name:${this.searchQuery}`;
      } else if (this.selectedFilter === 'code') {
        searchFilter = `code:${this.searchQuery}`;
      }
  
      let filterParams: string[] = [searchFilter];
      
      if (this.selectedBranch) {
        filterParams.push(`branch:${this.selectedBranch}`);
      }
      
      if (this.selectedCategory) {
        filterParams.push(`category:${this.selectedCategory}`);
      }
      
      if (this.selectedBrand) {
        filterParams.push(`brand:${this.selectedBrand}`);
      }
      
      if (this.currentFilter === 'active') {
        filterParams.push('isActive:true');
      } else if (this.currentFilter === 'inactive') {
        filterParams.push('isActive:false');
      }
  
      const filters = filterParams.join('+');
  
      let sortParam = '';
      if (this.sortField && this.sortDirection) {
        sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
      }
  
      const sub = this.offproductService
        .searchProducts(filters, this.currentPage, this.itemsPerPage, sortParam)
        .subscribe({
          next: (res) => {
            if (res.data) {
              this.products = Array.isArray(res.data.result)
                ? res.data.result
                : [res.data.result];
              this.showNoResults = this.products.length === 0;
              this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
              this.dropdownStates = new Array(this.products.length).fill(false);
              this.updatePaginationState();
              this.activeProductsCount = res.data.total;
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error searching products:', error);
            this.products = [];
            this.showNoResults = true;
            this.updatePaginationState();
            this.isLoading = false;
          },
        });
  
      this.subscriptions.push(sub);
    }
  
    updateSearchPlaceholder() {
      let placeholder = 'Search By';
      
      if (this.selectedFilter === 'code') {
        placeholder += ' Code';
      } else {
        placeholder += ' Name';
      }
      
      if (this.selectedBranch || this.selectedCategory || this.selectedBrand) {
        let filters = [];
        
        if (this.selectedBranch) {
          const branch = this.branches.find(b => b.id === this.selectedBranch);
          if (branch) {
            filters.push(`Branch: ${branch.main} ${branch.sub}`);
          }
        }
        
        if (this.selectedCategory) {
          const category = this.categories.find(c => c._id === this.selectedCategory);
          if (category) {
            filters.push(`Category: ${category.Cname}`);
          }
        }
        
        if (this.selectedBrand) {
          const brand = this.brands.find(b => b._id === this.selectedBrand);
          if (brand) {
            filters.push(`Brand: ${brand.Bname}`);
          }
        }
        
        if (filters.length > 0) {
          placeholder += ` (${filters.join(', ')})`;
        }
      }
  
      this.searchPlaceholder = placeholder;
    }
  
    onItemsPerPageChange(): void {
      this.currentPage = 1;
      this.pageCache = {};
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadProducts();
      }
    }
  
    toggleSort(field: 'createdAt' | 'price'): void {
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
        this.loadProducts();
      }
    }
  
    openAddModal(): void {
      this.newProduct = {
        name: '',
        code: '',
        description: '',
        cost: 0,
        category: '',
        brand: '',
        supplier: '',
        stock: 0
      };
    }
  
    loadBranches(): void {
      const sub = this.offproductService.getMappedBranches().subscribe({
        next: (res) => {
          if (res.message === 'success' && res.data) {
            this.branches = Object.keys(res.data).map((id) => {
              const location: string = res.data[id].location;
              const parts = location.split('-').map((s) => s.trim());
              return { id, main: parts[0], sub: parts[1] || '' };
            });
            
            const branchNode = this.filterNodes.find(node => node.name === 'Branch');
            if (branchNode) {
              branchNode.children = this.branches.map(branch => ({
                name: `${branch.main} ${branch.sub}`,
                type: 'branch',
                id: branch.id,
                value: branch.id
              }));
              this.filterDataSource.data = [...this.filterNodes];
            }
            
            this.updateSearchPlaceholder();
          }
        },
        error: (error) => {
          this.toaster.error('Failed to load branches', 'Error', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
        },
      });
      this.subscriptions.push(sub);
    }
  
    getBranchName(branchId: any): string {
      if (!branchId) {
        return 'N/A';
      }
      
      const branch = this.branches.find(b => b.id === branchId.toString());
      return branch ? `${branch.main} ${branch.sub}` : branchId.toString();
    }
  
    getCategoryName(categoryId: any): string {
      const category = this.categories.find(c => c._id === categoryId);
      return category ? category.Cname : categoryId;
    }
  
    getBrandName(brandId: any): string {
      const brand = this.brands.find(b => b._id === brandId);
      return brand ? brand.Bname : brandId;
    }
  
    getSupplierName(supplierId: any): string {
      const supplier = this.suppliers.find(s => s._id === supplierId);
      return supplier ? supplier.companyName : supplierId;
    }
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
  
    refreshProductData(): void {
      const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedBranch}_${this.selectedCategory}_${this.selectedBrand}`;
      if (this.pageCache[cacheKey]) {
        delete this.pageCache[cacheKey];
      }
      
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadProducts();
      }
      
      // We don't need these separate calls anymore as we get counts from loadProducts
      // this.getActiveProductsCount();
      this.getInActiveProductsCount();
    }
  
    hasChild = (_: number, node: FilterNode) => !!node.children && node.children.length > 0;
  
    filterSelectionChanged(node: FilterNode): void {
      if (!node.type) return;
  
      switch(node.type) {
        case 'branch':
          this.selectedBranch = node.id === this.selectedBranch ? '' : node.id || '';
          this.onBranchFilterChange();
          break;
        case 'category':
          this.selectedCategory = node.id === this.selectedCategory ? '' : node.id || '';
          this.onCategoryFilterChange();
          break;
        case 'brand':
          this.selectedBrand = node.id === this.selectedBrand ? '' : node.id || '';
          this.onBrandFilterChange();
          break;
      }
    }
  
    isNodeSelected(node: FilterNode): boolean {
      if (!node.type) return false;
  
      switch(node.type) {
        case 'branch':
          return node.id === this.selectedBranch;
        case 'category':
          return node.id === this.selectedCategory;
        case 'brand':
          return node.id === this.selectedBrand;
        default:
          return false;
      }
    }
  
    expandedSection: 'branch' | 'category' | 'brand' | null = null;
  
    toggleFilterSection(section: 'branch' | 'category' | 'brand'): void {
      this.expandedSection = this.expandedSection === section ? null : section;
    }
  
    selectBranch(branchId: string): void {
      this.selectedBranch = this.selectedBranch === branchId ? '' : branchId;
      this.onBranchFilterChange();
    }
  
    selectCategory(categoryId: string): void {
      this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
      this.onCategoryFilterChange();
    }
  
    selectBrand(brandId: string): void {
      this.selectedBrand = this.selectedBrand === brandId ? '' : brandId;
      this.onBrandFilterChange();
    }
  
    clearFilter(filterType: 'branch' | 'category' | 'brand'): void {
      if (filterType === 'branch') {
        this.selectedBranch = '';
        this.onBranchFilterChange();
      } else if (filterType === 'category') {
        this.selectedCategory = '';
        this.onCategoryFilterChange();
      } else if (filterType === 'brand') {
        this.selectedBrand = '';
        this.onBrandFilterChange();
      }
    }
  
    resetFilters(): void {
      this.selectedBranch = '';
      this.selectedCategory = '';
      this.selectedBrand = '';
      this.currentPage = 1;
      this.loadProducts();
      this.updateSearchPlaceholder();
      this.expandedSection = null;
    }

}
