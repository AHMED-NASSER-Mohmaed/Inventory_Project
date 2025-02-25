import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // SELLERS

  getPaginatedSellersByStatus(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/contact?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

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

  changeImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const headers = this.getHeaders();
    headers.delete('Content-Type'); 
    return this.http.patch(`${this.baseUrl}/updateImageProfileFor/${id}`, formData, { headers: headers });
  }

  updateSeller(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateSeller/${id}`, data, { headers: this.getHeaders() });
  }

  searchSellers(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getSellers?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // FEEDBACKS

  getFeedbacks(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/contact?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getFeedbackById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() });
  }

  markAsSeen(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/contact/${id}/mark-seen`, {}, { headers: this.getHeaders() });
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() });
  }

  sendAutoReply(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact/${id}/auto-reply`, {}, { headers: this.getHeaders() });
  }

  sendReply(id: string, reply: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact/${id}/reply`, { reply }, { headers: this.getHeaders() });
  }

  getActiveFeedbacksCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countContact?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInactiveFeedbacksCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countContact?filters=isActive:false`, { headers: this.getHeaders() });
  }

  getSeenFeedbacksCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countContact?filters=isSeen:true`, { headers: this.getHeaders() });
  }

  getUnseenFeedbacksCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countContact?filters=isSeen:false`, { headers: this.getHeaders() });
  }

  searchFeedbacks(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/contact?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
