import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(
    public http: HttpClient,
    private toastr: ToastrService
  ) { }
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
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.toastr.success('Category has been deactivated successfully');
        }),
        catchError((error) => {
          this.toastr.error(error.error.message || 'Failed to deactivate category');
          throw error;
        })
      );
  }

  activateCategory(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/activate/${id}`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.toastr.success('Category has been activated successfully');
        }),
        catchError((error) => {
          this.toastr.error(error.error.message || 'Failed to activate category');
          throw error;
        })
      );
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

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/categories/${id}`, data, { headers: this.getHeaders() })
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, data, { headers: this.getHeaders() })
  }
}
