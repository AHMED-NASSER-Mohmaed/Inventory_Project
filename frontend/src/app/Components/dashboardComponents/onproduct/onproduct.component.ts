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
import { decodeToken } from '../../../_helper/jwt-helper';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { OnproductsService } from '../../../_services/onproducts.service';

interface FilterNode {
  name: string;
  type?: string;
  id?: string;
  value?: string;
  children?: FilterNode[];
}

interface ProductImage {
  _id: string;
  fileId: string;
  url: string;
}

interface SellerDetails {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface SellerProductInfo {
  _id: string;
  stock: number;
  price: number;
  isDeleted: boolean;
  createdAt: string;
  sellerDetails: SellerDetails;
}

interface Product {
  _id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  brand: string;
  images: ProductImage[];
  isActive: boolean;
  status: string;
  createdAt: string;
  sellerProductsInfo: SellerProductInfo[];
}

@Component({
  selector: 'app-onproduct',
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
  templateUrl: './onproduct.component.html',
  styleUrl: './onproduct.component.css'
})
export class OnproductComponent implements OnInit, OnDestroy{
  private onproductsService: OnproductsService;
  private dialog: MatDialog;
  private toaster: ToastrService;
  
  filterNodes: FilterNode[] = [
    {
      name: 'Category',
      children: []
    },
    {
      name: 'Brand',
      children: []
    },
    {
      name: 'Status',
      children: [
        { name: 'Pending', type: 'status', value: 'pending' },
        { name: 'Approved', type: 'status', value: 'approved' },
        { name: 'Rejected', type: 'status', value: 'rejected' }
      ]
    }
  ];

  currentFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  products: Product[] = [];
  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedProduct: any = {};
  backupProduct: any = {};
  editing: boolean = false;

  subscriptions: Subscription[] = [];

  pageCache: { [key: string]: { result: Product[]; total: number } } = {};

  selectedFilter: string = 'name'; 
  searchQuery: string = '';

  showNoResults: boolean = false;

  lastSearchFilter: string = 'name';

  isLoading: boolean = true;

  sortField: 'createdAt' | 'price' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  searchPlaceholder: string = 'Search By Name...';

  tokenData: any = null;

  totalProductsCount: number = 0;

  categories: { _id: string; Cname: string }[] = [];
  brands: { _id: string; Bname: string }[] = [];

  selectedCategory: string = '';
  selectedBrand: string = '';
  selectedStatus: string = '';

  treeControl = new NestedTreeControl<FilterNode>(node => node.children);
  filterDataSource = new MatTreeNestedDataSource<FilterNode>();
  
  selectedImageIds: string[] = [];
  newImages: File[] = [];

  // Add necessary methods for product editing and image management
  toggleEdit(event?: any): void {
    if (this.editing) {
      const workingBackup = { ...this.backupProduct };
      const updatePayload = {
        name: this.selectedProduct.name,
        code: this.selectedProduct.code,
        description: this.selectedProduct.description,
        category: this.selectedProduct.category,
        brand: this.selectedProduct.brand
      };
      
      const sub = this.onproductsService
        .updateProductData(this.selectedProduct._id, updatePayload)
        .subscribe({
          next: (res: any) => {
            if (res.message === 'success') {
              this.toaster.success('Product updated successfully');
              this.backupProduct = { ...this.selectedProduct };
              
              this.refreshProductData();
            } else {
              this.selectedProduct = { ...workingBackup };
              this.toaster.error('Failed to update product');
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

  showProductInfo(product: Product): void {
    this.selectedProduct = { ...product };
    this.backupProduct = { ...product };
    this.selectedImageIds = [];
    this.newImages = [];
    this.editing = false;
  }

  deleteImageDirectly(productId: string, imageId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2, {
      data: { message: 'Are you sure you want to delete this image?' }
    });
    
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onproductsService.deleteProductImage(productId, imageId).subscribe({
          next: (res) => {
            this.toaster.success('Image deleted successfully');
            
            if (this.selectedProduct && this.selectedProduct.images) {
              this.selectedProduct.images = this.selectedProduct.images.filter(
                (img: ProductImage) => img._id !== imageId && img.fileId !== imageId
              );
              
              // Update product in list
              const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
              if (index !== -1) {
                this.products[index].images = [...this.selectedProduct.images];
              }
            }
          },
          error: (error) => {
            this.toaster.error(error.error?.message || 'Failed to delete image');
          }
        });
      }
    });
    this.subscriptions.push(sub);
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

    this.onproductsService.updateProductImages(
      this.selectedProduct._id, 
      this.selectedImageIds, 
      this.newImages
    ).subscribe({
      next: (res) => {
        this.toaster.success('Images updated successfully');
        if (res.data && res.data.images) {
          this.selectedProduct.images = res.data.images;
          
          // Update product in list
          const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
          if (index !== -1) {
            this.products[index].images = res.data.images;
          }
        }
        this.selectedImageIds = [];
        this.newImages = [];
      },
      error: (error) => {
        this.toaster.error(error.error?.message || 'Failed to update images');
      }
    });
  }

  deleteImage(imageId: string): void {
    if (this.selectedImageIds.includes(imageId)) {
      this.selectedImageIds = this.selectedImageIds.filter(id => id !== imageId);
    } else {
      this.selectedImageIds.push(imageId);
    }
  }

  isImageSelected(imageId: string): boolean {
    return this.selectedImageIds.includes(imageId);
  }

  refreshProductData(): void {
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedCategory}_${this.selectedBrand}_${this.selectedStatus}`;
    if (this.pageCache[cacheKey]) {
      delete this.pageCache[cacheKey];
    }
    
    this.loadProducts();
  }

  ngOnInit(): void {
    this.updateSearchPlaceholder();
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
    
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
    this.filterDataSource.data = this.filterNodes;
  }

  hideSingleSelectionIndicator = signal(true);

  loadProducts(): void {
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedCategory}_${this.selectedBrand}_${this.selectedStatus}`;

    if (this.pageCache[cacheKey]) {
      const cached = this.pageCache[cacheKey];
      this.products = cached.result;
      this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
      this.dropdownStates = new Array(this.products.length).fill(false);
      this.updatePaginationState();
      this.showNoResults = false;
      this.isLoading = false;
      this.totalProductsCount = cached.total;
      return;
    }

    this.isLoading = true;
    this.products = [];

    let filterParams: string[] = [];
    
    if (this.selectedCategory) {
      filterParams.push(`category:${this.selectedCategory}`);
    }
    if (this.selectedBrand) {
      filterParams.push(`brand:${this.selectedBrand}`);
    }
    if (this.selectedStatus) {
      filterParams.push(`status:${this.selectedStatus}`);
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

    const obs = this.onproductsService.getPaginatedProducts(
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
        this.totalProductsCount = total;
        this.totalPages = Math.ceil(total / this.itemsPerPage);
        this.dropdownStates = new Array(this.products.length).fill(false);
        this.pageCache[cacheKey] = { result: this.products, total: total };
        this.updatePaginationState();
        this.isLoading = false;
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message || 'Failed to load products', 'Failed', {
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
    const sub = this.onproductsService.getAllCategories().subscribe({
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
    const sub = this.onproductsService.getAllBrands().subscribe({
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

  onCategoryFilterChange(): void {
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.updateSearchPlaceholder();
    this.loadProducts();
  }

  onBrandFilterChange(): void {
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.loadProducts();
  }
  
  onStatusFilterChange(): void {
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

  // Product actions
  deActivateProduct(productId: string): void {
    const sub = this.onproductsService.deactivateProduct(productId).subscribe({
      next: (res) => {
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
      },
    });
    this.subscriptions.push(sub);
  }

  activateProduct(productId: string): void {
    const sub = this.onproductsService.activateProduct(productId).subscribe({
      next: (res) => {
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
      },
    });
    this.subscriptions.push(sub);
  }

  approveProduct(productId: string): void {
    const sub = this.onproductsService.approveProduct(productId).subscribe({
      next: (res) => {
        this.toaster.success('Product approved successfully');
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message || 'Failed to approve product', 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
      },
    });
    this.subscriptions.push(sub);
  }

  rejectProduct(productId: string): void {
    const sub = this.onproductsService.rejectProduct(productId).subscribe({
      next: (res) => {
        this.toaster.success('Product rejected successfully');
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message || 'Failed to reject product', 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
      },
    });
    this.subscriptions.push(sub);
  }

  activateSellerProduct(sellerProductId: string): void {
    const sub = this.onproductsService.activateSellerProduct(sellerProductId).subscribe({
      next: (res) => {
        this.toaster.success('Seller product activated successfully');
        
        if (this.selectedProduct && this.selectedProduct.sellerProductsInfo) {
          const sellerProductIndex = this.selectedProduct.sellerProductsInfo.findIndex((sp: SellerProductInfo) => sp._id === sellerProductId);
          if (sellerProductIndex !== -1) {
            this.selectedProduct.sellerProductsInfo[sellerProductIndex].isDeleted = false;
          }
        }
        
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message || 'Failed to activate seller product', 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
      },
    });
    this.subscriptions.push(sub);
  }

  deactivateSellerProduct(sellerProductId: string): void {
    const sub = this.onproductsService.deactivateSellerProduct(sellerProductId).subscribe({
      next: (res) => {
        this.toaster.success('Seller product deactivated successfully');
        
        if (this.selectedProduct && this.selectedProduct.sellerProductsInfo) {
          const sellerProductIndex = this.selectedProduct.sellerProductsInfo.findIndex((sp: SellerProductInfo) => sp._id === sellerProductId);
          if (sellerProductIndex !== -1) {
            this.selectedProduct.sellerProductsInfo[sellerProductIndex].isDeleted = true;
          }
        }
        
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.clear();
        this.toaster.error(error.error.message || 'Failed to deactivate seller product', 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
      },
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog(productId: string, action: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'deactivate') {
          this.deActivateProduct(productId);
        } else if (action === 'reject') {
          this.rejectProduct(productId);
        }
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialog2(productId: string, action: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'activate') {
          this.activateProduct(productId);
        } else if (action === 'approve') {
          this.approveProduct(productId);
        }
      }
    });
    this.subscriptions.push(sub);
  }

  openConfirmDialogSellerProduct(sellerProductId: string, isDeleted: boolean): void {
    if (isDeleted) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent2);
      const sub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.activateSellerProduct(sellerProductId);
        }
      });
      this.subscriptions.push(sub);
    } else {
      const dialogRef = this.dialog.open(ConfirmDialogComponent);
      const sub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.deactivateSellerProduct(sellerProductId);
        }
      });
      this.subscriptions.push(sub);
    }
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
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedStatus = '';
    this.loadProducts();
    this.updateSearchPlaceholder();
  }

  validateSearchInput(event: KeyboardEvent): boolean {
    if (this.selectedFilter === 'code') {
      const pattern = /^[0-9\-]$/;
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
      const pattern = /^[0-9\-]*$/;
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
    
    if (this.selectedCategory) {
      filterParams.push(`category:${this.selectedCategory}`);
    }
    
    if (this.selectedBrand) {
      filterParams.push(`brand:${this.selectedBrand}`);
    }
    
    if (this.selectedStatus) {
      filterParams.push(`status:${this.selectedStatus}`);
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

    const sub = this.onproductsService
      .searchProducts(filters, this.currentPage, this.itemsPerPage, sortParam)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.products = Array.isArray(res.data.result)
              ? res.data.result
              : [res.data.result];
            this.showNoResults = this.products.length === 0;
            this.totalPages = Math.ceil(res.data.total / this.itemsPerPage);
            this.totalProductsCount = res.data.total;
            this.dropdownStates = new Array(this.products.length).fill(false);
            this.updatePaginationState();
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
    
    if (this.selectedCategory || this.selectedBrand || this.selectedStatus) {
      let filters = [];
      
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
      
      if (this.selectedStatus) {
        filters.push(`Status: ${this.selectedStatus.charAt(0).toUpperCase() + this.selectedStatus.slice(1)}`);
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

  getCategoryName(categoryId: any): string {
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.Cname : 'Unknown Category';
  }

  getBrandName(brandId: any): string {
    const brand = this.brands.find(b => b._id === brandId);
    return brand ? brand.Bname : 'Unknown Brand';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  hasChild = (_: number, node: FilterNode) => !!node.children && node.children.length > 0;

  filterSelectionChanged(node: FilterNode): void {
    if (!node.type) return;

    switch(node.type) {
      case 'category':
        this.selectedCategory = node.id === this.selectedCategory ? '' : node.id || '';
        this.onCategoryFilterChange();
        break;
      case 'brand':
        this.selectedBrand = node.id === this.selectedBrand ? '' : node.id || '';
        this.onBrandFilterChange();
        break;
      case 'status':
        this.selectedStatus = node.value === this.selectedStatus ? '' : node.value || '';
        this.onStatusFilterChange();
        break;
    }
  }

  isNodeSelected(node: FilterNode): boolean {
    if (!node.type) return false;

    switch(node.type) {
      case 'category':
        return node.id === this.selectedCategory;
      case 'brand':
        return node.id === this.selectedBrand;
      case 'status':
        return node.value === this.selectedStatus;
      default:
        return false;
    }
  }

  expandedSection: 'category' | 'brand' | 'status' | null = null;

  toggleFilterSection(section: 'category' | 'brand' | 'status'): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
    this.onCategoryFilterChange();
  }

  selectBrand(brandId: string): void {
    this.selectedBrand = this.selectedBrand === brandId ? '' : brandId;
    this.onBrandFilterChange();
  }

  selectStatus(status: string): void {
    this.selectedStatus = this.selectedStatus === status ? '' : status;
    this.onStatusFilterChange();
  }

  clearFilter(filterType: 'category' | 'brand' | 'status'): void {
    if (filterType === 'category') {
      this.selectedCategory = '';
      this.onCategoryFilterChange();
    } else if (filterType === 'brand') {
      this.selectedBrand = '';
      this.onBrandFilterChange();
    } else if (filterType === 'status') {
      this.selectedStatus = '';
      this.onStatusFilterChange();
    }
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadProducts();
    this.updateSearchPlaceholder();
    this.expandedSection = null;
  }

  canUpdateProduct(product: any): boolean {
    return product && 
      (product.status === 'pending' || product.status === 'approved');
  }

  canToggleActivation(product: any): boolean {
    return product && product.status === 'approved';
  }

  constructor(
    onproductsService: OnproductsService,
    dialog: MatDialog,
    toaster: ToastrService
  ) {
    this.onproductsService = onproductsService;
    this.dialog = dialog;
    this.toaster = toaster;
  }
}
