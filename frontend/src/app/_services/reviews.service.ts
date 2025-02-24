import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  constructor(public http: HttpClient) { }
  baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProductReviews(id: string): any {
    return this.http.get(`${this.baseUrl}/products/${id}/reviews`, { headers: this.getHeaders() });
  }

  getUser(userId: string) {
    return this.http.get(`${this.baseUrl}/users/${userId}`, { headers: this.getHeaders() });
  }

  addReview(productId: string, review: { content: string; rating: number }) {
    return this.http.post(`${this.baseUrl}/products/${productId}/reviews`, review, { headers: this.getHeaders() });
  }

}
