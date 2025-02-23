import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersProfileService {

  constructor(public http: HttpClient) { }

  getMe(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get('http://127.0.0.1:3000/users/me', {headers} );
  }

  updateMe(firstName: string , lastName: string , phoneNumber: string , email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch('http://127.0.0.1:3000/updateCustomer', {firstName, lastName, phoneNumber, email}, {headers});
  }
}
