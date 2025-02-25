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

  // FEEDBACKS

  getFeedbacks(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/contact?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getFeedbackById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() });
  }

  // markAsSeen(id: string): Observable<any> {
  //   return this.http.patch(`${this.baseUrl}/contact/${id}/mark-seen`, {}, { headers: this.getHeaders() });
  // }

  deleteFeedback(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/contact/${id}`, {} ,{ headers: this.getHeaders() });
  }

  sendAutoReply(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact/${id}/auto-reply`, { headers: this.getHeaders() });
  }

  sendReply(id: string, reply: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact/${id}/reply`, { "content": reply }, { headers: this.getHeaders() });
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
