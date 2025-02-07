import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(public http: HttpClient) { }

  private baseUrl = 'http://localhost:3000';
  public token = localStorage.getItem('token');
  private headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.headers });
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {headers: this.headers});
  }

  getPaginatedSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?limit=${limit}&page=${page}` , {headers: this.headers});
  }

  deActiveSeller(SSN: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteSeller/${SSN}`, {headers: this.headers});
  } //! deactivate --> isactive

  activateSeller(SSN: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeSeller/${SSN}`, {headers: this.headers});
  } //! approve --> status  ,, 
}
