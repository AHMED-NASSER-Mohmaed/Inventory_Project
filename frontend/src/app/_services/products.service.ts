import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../_models/products';
import { category } from '../_models/category';
import { BrandResponse, CategoryResponse, ProductResponse } from '../_models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl = 'http://localhost:3000';

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
    let filterParts = [];
    
    if (searchTerm && searchTerm.trim() !== '') {
      filterParts.push(`name:${searchTerm.trim()}`);
    }
    
    if (category) {
      filterParts.push(`category:${category}`);
    }
    
    if (brand) {
      filterParts.push(`brand:${brand}`);
    }
    
    let params: any = {
      page: page.toString(),
      limit: itemsPerPage.toString()
    };
    
    if (filterParts.length > 0) {
      params.filters = filterParts.join('+');
    }
    
    if (sort) {
      params.sort = sort;
    }
    
    console.log('Request URL with search:', `${this.baseUrl}/OnlineProducts with params:`, params);
    
    return this.http.get<ProductResponse>(
      `${this.baseUrl}/OnlineProducts`, 
      { params, headers: this.getHeaders() }
    );
  }
}