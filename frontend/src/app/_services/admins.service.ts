import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminsService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getAdmins?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteAdmin/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeAdmin/${id}`, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/adminCount?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/adminCount?filters=isActive:false`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateAdmin/${id}`, data, { headers: this.getHeaders() });
  }

  searchCustomers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getAdmins?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addAdmin`, data, { headers: this.getHeaders() });
  }

  getMappedBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/maped`, { headers: this.getHeaders() });
  }
}
