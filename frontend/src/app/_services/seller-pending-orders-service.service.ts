import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SellerPendingOrdersServiceService {

  constructor(public http: HttpClient) {}
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllOrders(status: any) {
    return this.http.get(`${this.baseUrl}/AllSubOrdersForExternalSeller`, {
      params: { status },
      headers: this.getHeaders(),
    });
  }

  updateSuborder(
    orderId: string,
    updateData: { newStatus: string; fulfilledQuantities: object }
  ): Observable<any> {
    const url = `${this.baseUrl}/processSuborder/${orderId}`;
    console.log('Request URL:', url);
    const headers = this.getHeaders();

    return this.http.patch(url, updateData, { headers });
  }

}
