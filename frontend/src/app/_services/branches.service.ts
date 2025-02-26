import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  private baseUrl = 'http://localhost:3000';
  private pageCache: { [key: string]: { result: any[]; total: number } } = {};

  constructor(public http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedBranches(page: number, limit: number, governate?: number, sort?: string, filters?: string): Observable<any> {
    let filterStr = filters || '';
    if (governate) {
      filterStr += filterStr ? `+governate:${governate}` : `governate:${governate}`;
    }
    const sortParam = sort ? `&sort=${sort}` : '';
    const cacheKey = `${filterStr}_${page}_${sortParam}_${limit}`;

    if (this.pageCache[cacheKey]) {
      return new Observable(observer => {
        observer.next({ data: this.pageCache[cacheKey] });
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/branches?filters=${filterStr}${sortParam}&page=${page}&limit=${limit}`;
    return new Observable(observer => {
      this.http.get(url, { headers: this.getHeaders() }).subscribe({
        next: (response: any) => {
          this.pageCache[cacheKey] = response.data;
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  clearCache(): void {
    this.pageCache = {};
  }

  getPaginatedCustomersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getClerks?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deActiveCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/branches/delete/${id}`, { headers: this.getHeaders() });
  }

  activateCustomer(id: string, branchId?: string): Observable<any> {
    const url = branchId = `${this.baseUrl}/branches/active/${id}`;
    return this.http.patch(url, {}, { headers: this.getHeaders() });
  }

  getActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/count?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInActiveCustomersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/count?filters=isActive:false`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/branches/update/${id}`, data, { headers: this.getHeaders() });
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

  addBranch(data: { governate: number; location: string; registrationNumber: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/branches`, data, { headers: this.getHeaders() });
  }
  
}
