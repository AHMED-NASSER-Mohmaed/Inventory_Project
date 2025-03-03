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
import { decodeToken } from '../../../../_helper/jwt-helper';
import { AddProductsForSellerService } from '../../../../_services/add-products-for-seller.service';

interface FilterNode {
  name: string;
  type?: string;
  id?: string;
  value?: string;
  children?: FilterNode[];
}

@Component({
  selector: 'app-add-products',
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
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.css'
})
export class AddProductsComponent implements OnInit, OnDestroy {
  currentFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  products: any[] = [];
  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedProduct: any = {};
  
  isSearchMode: boolean = false;
  subscriptions: Subscription[] = [];
  pageCache: { [key: string]: { result: any[]; total: number } } = {};
  selectedFilter: string = 'name'; 
  searchQuery: string = '';
  showNoResults: boolean = false;
  lastSearchFilter: string = 'name';
  isLoading: boolean = true;
  sortField: 'createdAt' | 'price' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  searchPlaceholder: string = ' Search By Name...';
  tokenData: any = null;
  categories: { _id: string; Cname: string }[] = [];
  brands: { _id: string; Bname: string }[] = [];
  selectedCategory: string = '';
  selectedBrand: string = '';

  // New model for adding new product
  newProduct: {
    name: string;
    code: string;
    price: number;
    category: string;
    brand: string;
    stock: number;
  } = {
    name: '',
    code: '',
    price: 0,
    category: '',
    brand: '',
    stock: 0
  };

  // Model for selling existing product
  sellProductData: {
    productId: string;
    stock: number;
    price: number;
  } = {
    productId: '',
    stock: 0,
    price: 0
  };

  treeControl = new NestedTreeControl<FilterNode>(node => node.children);
  filterDataSource = new MatTreeNestedDataSource<FilterNode>();
  filterNodes: FilterNode[] = [
    { name: 'Category', children: [] },
    { name: 'Brand', children: [] }
  ];

  // Add property for total available products
  totalAvailableProducts: number = 0;

  constructor(
    private addProductForSellerService: AddProductsForSellerService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

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
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedCategory}_${this.selectedBrand}`;

    if (this.pageCache[cacheKey]) {
      const cached = this.pageCache[cacheKey];
      this.products = cached.result;
      this.totalPages = Math.ceil(cached.total / this.itemsPerPage);
      this.totalAvailableProducts = cached.total; // Set total from cache
      this.dropdownStates = new Array(this.products.length).fill(false);
      this.updatePaginationState();
      this.showNoResults = false;
      this.isLoading = false;
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
    
    const filterParam = filterParams.length > 0 ? filterParams.join('+') : '';

    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
    }

    const obs = this.addProductForSellerService.getAvailableProducts(
      this.currentPage,
      this.itemsPerPage,
      filterParam,
      sortParam
    );

    const sub = obs.subscribe({
      next: (res) => {
        this.products = res.data.result;
        this.showNoResults = this.products.length === 0;
        const total = res.data.total;
        this.totalAvailableProducts = total; // Set total from response
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
    const sub = this.addProductForSellerService.getAllCategories().subscribe({
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
    const sub = this.addProductForSellerService.getAllBrands().subscribe({
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

  showProductInfo(product: any): void {
    this.selectedProduct = { ...product };
    console.log("Selected product:", this.selectedProduct);
  }

  prepareForSelling(product: any): void {
    this.selectedProduct = { ...product };
    this.sellProductData = {
      productId: product._id,
      stock: 0,
      price: 0
    };
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) =>
      i === index ? !state : false
    );
  }

  addNewProduct(): void {
    if (!this.newProduct.name || !this.newProduct.code || !this.newProduct.category ||
        !this.newProduct.brand || this.newProduct.price <= 0 || this.newProduct.stock <= 0) {
      this.toaster.error('Please fill all required fields with valid values');
      return;
    }

    this.addProductForSellerService.addNewProduct(this.newProduct).subscribe({
      next: (res) => {
        this.toaster.success('New product added successfully');
        
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
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        
        this.newProduct = {
          name: '',
          code: '',
          price: 0,
          category: '',
          brand: '',
          stock: 0
        };
        
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.error(error.error.message || 'Failed to add new product');
      }
    });
  }

  sellExistingProduct(): void {
    if (!this.sellProductData.stock || this.sellProductData.stock <= 0) {
      this.toaster.error('Please enter a valid stock quantity');
      return;
    }

    if (!this.sellProductData.price || this.sellProductData.price <= 0) {
      this.toaster.error('Please enter a valid price');
      return;
    }

    this.addProductForSellerService.addExistingProduct(this.sellProductData).subscribe({
      next: (res) => {
        this.toaster.success('Product added for selling successfully');
        
        // Close modal with pure JavaScript
        const modalElement = document.getElementById('sellProductModal');
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
        
        this.sellProductData = {
          productId: '',
          stock: 0,
          price: 0
        };
        
        this.refreshProductData();
      },
      error: (error) => {
        this.toaster.error(error.error.message || 'Failed to add product for selling');
      }
    });
  }

  openAddModal(): void {
    this.newProduct = {
      name: '',
      code: '',
      price: 0,
      category: '',
      brand: '',
      stock: 0
    };
  }

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
    
    if (this.selectedCategory) {
      filterParams.push(`category:${this.selectedCategory}`);
    }
    
    if (this.selectedBrand) {
      filterParams.push(`brand:${this.selectedBrand}`);
    }

    const filters = filterParams.join('+');

    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
    }

    const sub = this.addProductForSellerService
      .searchAvailableProducts(filters, this.currentPage, this.itemsPerPage, sortParam)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.products = Array.isArray(res.data.result)
              ? res.data.result
              : [res.data.result];
            this.showNoResults = this.products.length === 0;
            this.totalAvailableProducts = res.data.total; // Set total from response
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
    
    if (this.selectedCategory || this.selectedBrand) {
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
    return category ? category.Cname : categoryId;
  }

  getBrandName(brandId: any): string {
    const brand = this.brands.find(b => b._id === brandId);
    return brand ? brand.Bname : brandId;
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
    }
  }

  isNodeSelected(node: FilterNode): boolean {
    if (!node.type) return false;

    switch(node.type) {
      case 'category':
        return node.id === this.selectedCategory;
      case 'brand':
        return node.id === this.selectedBrand;
      default:
        return false;
    }
  }

  expandedSection: 'category' | 'brand' | null = null;

  toggleFilterSection(section: 'category' | 'brand'): void {
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

  clearFilter(filterType: 'category' | 'brand'): void {
    if (filterType === 'category') {
      this.selectedCategory = '';
      this.onCategoryFilterChange();
    } else if (filterType === 'brand') {
      this.selectedBrand = '';
      this.onBrandFilterChange();
    }
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
    this.updateSearchPlaceholder();
    this.expandedSection = null;
  }

  refreshProductData(): void {
    const cacheKey = `${this.currentFilter}_${this.currentPage}_${this.sortField}_${this.sortDirection}_${this.selectedCategory}_${this.selectedBrand}`;
    if (this.pageCache[cacheKey]) {
      delete this.pageCache[cacheKey];
    }
    
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadProducts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
