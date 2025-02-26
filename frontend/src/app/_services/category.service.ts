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

  getPaginatedCategories(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/categories?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deactivateCategory(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  activateCategory(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  getActiveCategoriesCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/count?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInactiveCategoriesCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/count?filters=isActive:false`, { headers: this.getHeaders() });
  }

  searchCategories(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/categories?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
