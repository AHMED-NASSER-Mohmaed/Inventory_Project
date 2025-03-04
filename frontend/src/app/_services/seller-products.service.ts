import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerProductsService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/seller/Product?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deactivateProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller/deActiveProduct/${id}`, { headers: this.getHeaders() });
  }

  activateProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/seller/activeProduct/${id}`, {}, { headers: this.getHeaders() });
  }

  updateProductData(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/seller/updateProduct/${productId}`, data, { headers: this.getHeaders() });
  }

  searchProducts(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/seller/Product?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }
}
