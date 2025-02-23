import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    let url = '';
    if(filters === 'isActive:true') {
      url = `${this.baseUrl}/categories/active?page=${page}&limit=${limit}${sort || ''}`;
      console.log(url);
    } else if(filters === 'isActive:false') {
      url = `${this.baseUrl}/categories/deActive?page=${page}&limit=${limit}${sort || ''}`;
    } else {
      const filterParam = filters ? `filters=${filters}` : '';
      url = `${this.baseUrl}/categories?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
      console.log(filters);

    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/active/${id}`, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/count?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/count?filters=isActive:false`, { headers: this.getHeaders() });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/active/${id}`, data, { headers: this.getHeaders() });
  }

  searchCustomers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/suppliers?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, data, { headers: this.getHeaders() });
  }
}
