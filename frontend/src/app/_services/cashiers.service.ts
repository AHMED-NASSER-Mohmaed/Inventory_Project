import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CashiersService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getCashier?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteCashier/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string, branchId?: string): Observable<any> {
    const url = branchId 
      ? `${this.baseUrl}/activeCashier/${id}/${branchId}` 
      : `${this.baseUrl}/activeCashier/${id}`;
    return this.http.patch(url, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cashiersCount?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cashiersCount?filters=isActive:false`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateCashier/${id}`, data, { headers: this.getHeaders() });
  }

  searchCustomers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getCashier?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addCashier`, data, { headers: this.getHeaders() });
  }

  getMappedBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/maped`, { headers: this.getHeaders() });
  }

  activateCustomerWithBranch(id: string, branchId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeCashier/${id}/${branchId}`, {}, { headers: this.getHeaders() });
  }

}
