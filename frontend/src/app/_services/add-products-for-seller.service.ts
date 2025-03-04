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

  getAvailableProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getAllAvailableProduct?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
  
  addNewProduct(productData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller/addNewProduct`, productData, { headers: this.getHeaders() });
  }
  
  addExistingProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller/addExistingProduct`, data, { headers: this.getHeaders() });
  }

  searchAvailableProducts(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getAllAvailableProduct?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }
  
  getSellerProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/seller/myProducts?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
  
  updateSellerProduct(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/seller/updateProduct/${productId}`, data, { headers: this.getHeaders() });
  }
}
