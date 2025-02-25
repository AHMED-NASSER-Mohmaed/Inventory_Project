import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getCart(sessionId?: string): Observable<any> { // sweet alert if there was no cart for the user (he should add products)
    let url = `${this.apiUrl}`;
    const options = { headers: this.getHeaders() };

    if ( sessionId) {
      url += `?sessionId=${sessionId}`; // for guest users
    }
    
     return this.http.get(url, options);
  }

  addToCart(productId: string, quantity: number, sessionId?: string): Observable<any> {
    const body: any = { productId, quantity };
    // const body: any = {productId: '67b8f7c83c7eb38260dfc804',  quantity: 2};
    // const body: any = {productId,  quantity};
    console.log(body);
    console.log("hahahhahhahha");
    if (!localStorage.getItem('token')) {
      body.sessionId = sessionId; // Send sessionId if the user is not logged in or fo guest users
    }
    return this.http.post(`${this.apiUrl}/add`, body, { headers: this.getHeaders() });
  }

  removeFromCart(productId: string, sessionId?: string): Observable<any> {
    let url = `${this.apiUrl}/product/${productId}`;
    if (!localStorage.getItem('token') && sessionId) {
      url += `?sessionId=${sessionId}`;
    }

    return this.http.delete(url, { headers: this.getHeaders() });
  }

  clearCart(sessionId?: string): Observable<any> {
    let url = `${this.apiUrl}/clear`;
    if (!localStorage.getItem('token') && sessionId) {
      url += `?sessionId=${sessionId}`;
    }

    return this.http.delete(url, { headers: this.getHeaders() });
  }

  mergeGuestCart(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/merge`, { sessionId }, { headers: this.getHeaders() });
  }

  placeOrder(form: any): Observable<any> {
    return this.http.post('http://localhost:3000/order-container-online', {form}, { headers: this.getHeaders() });
  }
  
}
