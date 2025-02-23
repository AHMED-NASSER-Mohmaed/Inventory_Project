import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersProfileService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getMe(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/users/me`, {headers} );
  }

  updateMe(firstName: string , lastName: string , phoneNumber: string , email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/updateCustomer`, {firstName, lastName, phoneNumber, email}, {headers});
  }

  changeImage( file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.post(`${this.baseUrl}/updateImageProfile`, formData, { headers: headers });
  }

  
}
