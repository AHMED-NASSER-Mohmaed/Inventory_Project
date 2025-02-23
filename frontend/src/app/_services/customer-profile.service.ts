import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersProfileService {

  constructor(public http: HttpClient) { }

  updateMe(firstName: string , lastName: string , phoneNumber: string , email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post('http://127.0.0.1:3000/updateCustomer', {firstName, lastName, phoneNumber, email}, {headers});
  }
}
