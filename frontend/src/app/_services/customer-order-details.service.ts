import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  productId: string;
  productName: string;
  productUrlImage: string;
  productCode: string;
  productPrice: number;
  productStock: number;
  productRequestedQuantity: number;
  productFulfilledQuantity: number;
  productCanceledQuantity: number;
}

export interface Order {
  orderId: string;
  orderStatus: string;
  customerName: string;
  sellerName: string;
  products: Product[];
  orderTotalQty: number;
  orderTotalPrice: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerOrderDetailsService {

  private baseUrl = 'http://localhost:3000';
  
    constructor(private http: HttpClient) { }
  
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders().set('Authorization', `Bearer ${token}` );
      }
  
    getOnlineOrders(): Observable<any> {
      return this.http.get(`${this.baseUrl}/allSuborders/online`,{ headers: this.getHeaders() });
    }
  
    getOfflineOrders(): Observable<any> {
      return this.http.get(`${this.baseUrl}/allSuborders/offline`,{ headers: this.getHeaders() });
    }

    getCustomerOrders(): Observable<Order[]> {
      return this.http.get<Order[]>(`${this.baseUrl}/customerOrders`, { headers: this.getHeaders() });
    }

    cancelOrder(orderId: string): Observable<any> {
      return this.http.patch(`${this.baseUrl}/customerOrders/cancelWholeOrder/${orderId}`, {}, 
        { headers: this.getHeaders() });
    }

    cancelProductsFromOrder(orderId: string, productIds: string[]): Observable<any> {
      return this.http.patch(
        `${this.baseUrl}/customerOrders/cancelSomeProductsInTheOrder/${orderId}`,
        { productIds },
        { headers: this.getHeaders() }
      );
    }

}
