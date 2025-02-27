import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../_models/products';
import { category } from '../_models/category';
import { CategoryResponse, ProductResponse } from '../_models/api-responses';

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

  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }

  getFeaturedProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/getProducts?limit=3`, { headers: this.getHeaders() });
  }

  getPaginatedProducts(page: number, itemsPerPage: number, sort: string, category: string, brand: string): Observable<any> {
    const params = {
      page: page.toString(),
      limit: itemsPerPage.toString(),
      sort: sort,
      category: category,
      brand: brand
    };
    return this.http.get(`${this.baseUrl}/OnlineProducts`, { params, headers: this.getHeaders() });
  }
}