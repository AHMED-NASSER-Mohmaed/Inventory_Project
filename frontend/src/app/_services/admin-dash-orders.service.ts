import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

export interface Product {
  productId: string;
  productName: string;
  productUrlImage: string;
  productCode: string;
  productPrice: number;
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

interface OrderContainer {
  _id: string;
  orderType: string;
  gov: string;
  address: string;
  phone1: string;
  phone2: string;
  status: string;
  branch: { _id: number; location: string };
  createdAt: string;
  updatedAt: string;
  products: Array<{
    productId: string;
    name: string;
    code: string;
    price: number;
    totalPrice: number;
    requestedQuantity: number;
    fulfilledQuantity: number;
    canceledQuantity: number;
    images: string[];
  }>;
  totalPrice: number;
  totalQty: number;
  clerk: { name: string };
  cashier: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashOrdersService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders().set('Authorization', `Bearer ${token}` );
    }

  getOnlineOrders(): Observable<any> {
    // Since there's no online order API anymore, return an empty array
    return of({ allOnlineSuborders: [] });
  }

  getOfflineOrders(): Observable<any> {
    return this.http.get<{message: string, orderContainers: OrderContainer[]}>(`${this.baseUrl}/order-container-offline`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          const allOfflineSuborders = this.mapOrderContainersToOrders(response.orderContainers || []);
          return { allOfflineSuborders };
        })
      );
  }

  private mapOrderContainersToOrders(orderContainers: OrderContainer[]): Order[] {
    return orderContainers.map(container => { //!!!!!!!!!!!!!!!!!
      return {
        orderId: container._id,
        orderStatus: container.status,
        customerName: container.phone1 ,
        sellerName: container.clerk?.name || 'Clerk 1',
        products: container.products.map(prod => ({
          productId: prod.productId,
          productName: prod.name,
          productUrlImage: prod.images?.[1] ,
          productCode: prod.code,
          productPrice: prod.price,
          productRequestedQuantity: prod.requestedQuantity,
          productFulfilledQuantity: prod.fulfilledQuantity,
          productCanceledQuantity: prod.canceledQuantity
        })),
        orderTotalQty: container.totalQty,
        orderTotalPrice: container.totalPrice,
        createdAt: container.createdAt,
        updatedAt: container.updatedAt
      };
    });
  }
}
