import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class BrandsService {

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
      const url = `${this.baseUrl}/brands?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
      return this.http.get(url, { headers: this.getHeaders() });
    }
  
    deactivateCategory(id: string): Observable<any> {
      return this.http.delete(`${this.baseUrl}/brands/${id}`, { headers: this.getHeaders() })
        .pipe(
          tap(() => {
            this.toastr.success('Brand has been deactivated successfully');
          }),
          catchError((error) => {
            this.toastr.error(error.error.message || 'Failed to deactivate brand');
            throw error;
          })
        );
    }
  
    activateCategory(id: string): Observable<any> {
      return this.http.patch(`${this.baseUrl}/brands/active/${id}`, {}, { headers: this.getHeaders() })
        .pipe(
          tap(() => {
            this.toastr.success('Brand has been activated successfully');
          }),
          catchError((error) => {
            this.toastr.error(error.error.message || 'Failed to activate brand');
            throw error;
          })
        );
    }
  
    getActiveCategoriesCount(): Observable<any> {
      return this.http.get(`${this.baseUrl}/brands/count?filters=isActive:true`, { headers: this.getHeaders() });
    }
  
    getInactiveCategoriesCount(): Observable<any> {
      return this.http.get(`${this.baseUrl}/brands/count?filters=isActive:false`, { headers: this.getHeaders() });
    }
  
    searchCategories(filters: string, page: number, limit: number, sort?: string): Observable<any> {
      const url = `${this.baseUrl}/brands?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
      return this.http.get(url, { headers: this.getHeaders() });
    }
  
    updateCategory(id: string, data: any): Observable<any> {
      return this.http.patch(`${this.baseUrl}/brands/${id}`, data, { headers: this.getHeaders() })
    }
  
    createCategory(data: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/brands`, data, { headers: this.getHeaders() })
    }
}
