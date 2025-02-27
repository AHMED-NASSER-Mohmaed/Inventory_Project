import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { ConfirmDialogImgchangeComponent } from '../../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { OffproductService } from '../../../_services/offproduct.service';
import { OffProduct, ProductImage } from '../../../_models/offproduct';
import { MatTreeNestedDataSource, MatTreeModule } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Define a TreeNode interface for filter structure
interface FilterNode {
  name: string;
  type?: string;
  id?: string;
  value?: string;
  children?: FilterNode[];
}

@Component({
  selector: 'app-offproduct',
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
  templateUrl: './offproduct.component.html',
  styleUrl: './offproduct.component.css',
})
export class OffproductComponent implements OnInit, OnDestroy {
  // Filter state and pagination
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

  subscriptions: Subscription[] = [];

  // Cache for storing product pages
  pageCache: { [key: string]: { result: OffProduct[]; total: number } } = {};

  selectedFilter: string = 'name'; // Default filter
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

  // Tree related properties
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
    this.updateSearchPlaceholder();
    this.loadProducts();
    this.getInActiveProductsCount();
    this.getActiveProductsCount();
    this.loadBranches();
    this.loadCategories();
    this.loadBrands();
    this.loadSuppliers();
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
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
        
        // Update tree nodes with categories
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
        
        // Update tree nodes with brands
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
    const sub = this.offproductService.getActiveProductsCount().subscribe({
      next: (res) => {
        this.activeProductsCount = res.data && res.data[0] ? res.data[0].total || 0 : 0;
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
              
              // Refresh data to ensure consistency with server
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

  // Direct deletion of an image from the server
  deleteImageDirectly(imageId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.offproductService.deleteProductImage(this.selectedProduct.product._id, imageId).subscribe({
          next: (res) => {
            this.toaster.success('Image deleted successfully');
            
            // Remove the image from the UI
            if (this.selectedProduct && this.selectedProduct.product && this.selectedProduct.product.images) {
              this.selectedProduct.product.images = this.selectedProduct.product.images.filter(
                (img: ProductImage) => img._id !== imageId
              );
              
              // Update the product in the list
              const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
              if (index !== -1) {
                this.products[index].product.images = [...this.selectedProduct.product.images];
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

  // Keep the original method for batch deletion
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
        // Update the product images in the UI
        if (res.data && res.data.images) {
          this.selectedProduct.product.images = res.data.images;
          // Also update in the products array
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
        
        // Close modal with pure JavaScript
        const modalElement = document.getElementById('stockUpdateModal');
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
        
        this.stockUpdateQuantity = 0;
        
        // Refresh data
        this.refreshProductData();
      },
      error: (error) => {
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
      this.selectedProduct.product._id,
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
        
        // Close modal with pure JavaScript
        const modalElement = document.getElementById('addProductModal');
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
        
        // Clear form
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
        
        // Refresh product data from server to ensure consistent data display
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
          
          // Update tree nodes with branches
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

  // New method to refresh data while preserving filters
  refreshProductData(): void {
    // Clear cache for current view to ensure fresh data
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedBranch}_${this.selectedCategory}_${this.selectedBrand}`;
    if (this.pageCache[cacheKey]) {
      delete this.pageCache[cacheKey];
    }
    
    // Reload data based on current mode
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadProducts();
    }
    
    // Also refresh counts
    this.getActiveProductsCount();
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

  // Add property to track expanded filter section
  expandedSection: 'branch' | 'category' | 'brand' | null = null;

  // Toggle filter section visibility
  toggleFilterSection(section: 'branch' | 'category' | 'brand'): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  // Select branch filter
  selectBranch(branchId: string): void {
    // Toggle if already selected
    this.selectedBranch = this.selectedBranch === branchId ? '' : branchId;
    this.onBranchFilterChange();
  }

  // Select category filter
  selectCategory(categoryId: string): void {
    // Toggle if already selected
    this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
    this.onCategoryFilterChange();
  }

  // Select brand filter
  selectBrand(brandId: string): void {
    // Toggle if already selected
    this.selectedBrand = this.selectedBrand === brandId ? '' : brandId;
    this.onBrandFilterChange();
  }

  // Clear specific filter
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

  // Reset all filters - use existing method but expand functionality
  resetFilters(): void {
    this.selectedBranch = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
    this.updateSearchPlaceholder();
    // Close any expanded section
    this.expandedSection = null;
  }
}
