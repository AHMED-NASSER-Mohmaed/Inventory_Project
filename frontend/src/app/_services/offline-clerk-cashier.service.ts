import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { BrandResponse, CategoryResponse, ProductResponse } from '../_models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class OfflineClerkCashierService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';
  public products: any[] = []
  private cache: { [key: string]: ProductResponse } = {};


 

  getAllOrders(status: any){

    return this.http.get(`${this.baseUrl}/order-container-offline`, { params: { status } ,  headers: this.getHeaders() });

  }
  
  updateSuborder(orderId: string, updateData: { newStatus: string; fulfilledQuantities: object }): Observable<any> {
    const url = `${this.baseUrl}/finalize-order-container-offline/${orderId}`;
    console.log('Request URL:', url); 
    const headers = this.getHeaders(); 
    const params = { newStatus: updateData.newStatus };
    return this.http.patch(url, {} ,  { params, headers });
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    // Initialize headers with default values
    let headers = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    // Add Authorization header only if token exists
    if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
        console.warn('No authentication token found in localStorage.');
    }

    return headers;
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

    placeOrder(order: any): Observable<any> {
        console.log("Sending Order:", order);
        return this.http.post('http://localhost:3000/order-container-offline', order, { headers: this.getHeaders() });
    }
    
}

