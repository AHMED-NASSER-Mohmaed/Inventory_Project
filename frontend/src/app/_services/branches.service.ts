import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getClerks?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteClerk/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string, branchId?: string): Observable<any> {
    const url = branchId 
      ? `${this.baseUrl}/activeClerk/${id}/${branchId}` 
      : `${this.baseUrl}/activeClerk/${id}`;
    return this.http.patch(url, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clerkCount?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clerkCount?filters=isActive:false`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateClerk/${id}`, data, { headers: this.getHeaders() });
  }

  searchCustomers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getClerks?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addClerk`, data, { headers: this.getHeaders() });
  }

  getMappedBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/maped`, { headers: this.getHeaders() });
  }

  activateCustomerWithBranch(id: string, branchId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeClerk/${id}/${branchId}`, {}, { headers: this.getHeaders() });
  }
  
}
