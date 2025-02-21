import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getCustomers?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/---/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/---/${id}`, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/---?filters=isActive:true`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateSeller/${id}`, data, { headers: this.getHeaders() });
  }

  searchCustomers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getCustomers?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}