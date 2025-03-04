import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SAanalsisService {

  private baseUrl = 'http://localhost:3000';
  
    constructor(private http: HttpClient) { }
    
    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    
    getAdminAnalytics(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/admin-dashboard/analytics`, {
        headers: this.getHeaders()
      });
    }
}
