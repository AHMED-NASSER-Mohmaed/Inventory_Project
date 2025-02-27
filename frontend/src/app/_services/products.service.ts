import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from '../_models/products';
import { category } from '../_models/category';
import { BrandResponse, CategoryResponse, ProductResponse } from '../_models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl = 'http://localhost:3000';
  
  // Cache for storing API responses
  private cache: { [key: string]: ProductResponse } = {};
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  getAllBrands(): Observable<BrandResponse> {
    return this.http.get<BrandResponse>(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }

  getFeaturedProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/OnlineProducts?limit=3`, { headers: this.getHeaders() });
  }

  getPaginatedProducts(page: number, itemsPerPage: number, sort: string, category: string, brand: string, searchTerm: string = ''): Observable<ProductResponse> {
    let filterParts: string[] = [];
    
    if (searchTerm && searchTerm.trim() !== '') {
      filterParts.push(`name:${searchTerm.trim()}`);
    }
    
    if (category) {
      filterParts.push(`category:${category}`);
    }
    
    if (brand) {
      filterParts.push(`brand:${brand}`);
    }
    
    let url = `${this.baseUrl}/OnlineProducts?page=${page}&limit=${itemsPerPage}`;
    
    if (filterParts.length > 0) {
      url += `&filters=${filterParts.join(' ')}`;
    }
    
    if (sort) {
      url += `&sort=${sort}`;
    }
    
    const cacheKey = url;
    
    if (this.cache[cacheKey]) {
      console.log('Using cached data for:', url);
      return of(this.cache[cacheKey]);
    }
    
    console.log('Fetching fresh data for:', url);
    
    return this.http.get<ProductResponse>(url, { headers: this.getHeaders() })
      .pipe(
        tap((response: ProductResponse) => {
          this.cache[cacheKey] = response;
        })
      );
  }
  
  clearCacheItem(page: number, itemsPerPage: number, sort: string, category: string, brand: string, searchTerm: string = ''): void {
    let filterParts: string[] = [];
    
    if (searchTerm && searchTerm.trim() !== '') {
      filterParts.push(`name:${searchTerm.trim()}`);
    }
    
    if (category) {
      filterParts.push(`category:${category}`);
    }
    
    if (brand) {
      filterParts.push(`brand:${brand}`);
    }
    
    let url = `${this.baseUrl}/OnlineProducts?page=${page}&limit=${itemsPerPage}`;
    
    if (filterParts.length > 0) {
      url += `&filters=${filterParts.join(' ')}`;
    }
    
    if (sort) {
      url += `&sort=${sort}`;
    }
    
    delete this.cache[url];
  }
  
  clearCache(): void {
    this.cache = {};
  }
}