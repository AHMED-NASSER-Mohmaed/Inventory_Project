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

  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  getPaginatedSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?limit=${limit}&page=${page}`, { headers: this.getHeaders() });
  }

  deActiveSeller(SSN: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteSeller/${SSN}`, { headers: this.getHeaders() });
  }

  activateSeller(SSN: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeSeller/${SSN}`, {}, { headers: this.getHeaders() });
  }

  getPaginatedWaitingSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pendingSellers?page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    for (const entry of formData.entries()) {
        console.log(entry[0], entry[1]);
    }

    const headers = this.getHeaders();
    headers.delete('Content-Type'); 

    return this.http.patch(`${this.baseUrl}/updateProfileImage/${id}`, formData, { headers: headers }
    );
  }

  updateSeller(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateSeller/${id}`, data, { headers: this.getHeaders() });
  }
  
}