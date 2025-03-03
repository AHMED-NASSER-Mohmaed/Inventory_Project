import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddProductsForSellerService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get available products for selling
  getAvailableProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getAllAvailableProduct?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
  
  // Add a new product as a seller
  addNewProduct(productData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller/addNewProduct`, productData, { headers: this.getHeaders() });
  }
  
  // Add an existing product to sell
  addExistingProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller/addExistingProduct`, data, { headers: this.getHeaders() });
  }

  // Search available products
  searchAvailableProducts(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getAllAvailableProduct?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Get all categories
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  // Get all brands
  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }
  
  // Get seller's products
  getSellerProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/seller/myProducts?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
  
  // Update product price or stock
  updateSellerProduct(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/seller/updateProduct/${productId}`, data, { headers: this.getHeaders() });
  }
}
