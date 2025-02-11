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




  //!!!!!!!!!!!!!!!!!!!!!!! SELLLERRRSSSSSSSSSS

  //* getters
  getPaginatedSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?limit=${limit}&page=${page}`, { headers: this.getHeaders() });
  }

  getPaginatedWaitingSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?filters=isActive:false+status:0&page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  getPaginatedRejectedSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?filters=isActive:true+status:-1&page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  getPaginatedApprovedSellers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getSellers?filters=status:1&page=${page}&limit=${limit}`, { headers: this.getHeaders() });
    // http://localhost:3000/getSellers?filters=isActive:false+status:1&limit=51&page=1
  }

  //* activate - deactivate - approve - reject
  deActiveSeller(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteSeller/${id}`, { headers: this.getHeaders() });
  }

  activateSeller(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeSeller/${id}`, {}, { headers: this.getHeaders() });
  }

  approveSeller(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/approveSeller/${id}`, {}, { headers: this.getHeaders() });
  }

  rejectSeller(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/rejectSeller/${id}`, {}, { headers: this.getHeaders() });
  }

  //* Totals
  getActiveSellersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sellerCount?filters=isActive:true+status:1`, { headers: this.getHeaders() });
  }

  getDeActiveSellersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sellerCount?filters=isActive:false+status:1`, { headers: this.getHeaders() });
  }

  getWaitingSellersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sellerCount?filters=isActive:true+status:0`, { headers: this.getHeaders() });
  }

  getRejectedSellersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sellerCount?filters=isActive:true+status:-1`, { headers: this.getHeaders() });
  }

//!!!!!!!!!!!!!!!!!!!!!!!!


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