import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminFashboardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationAsSeen(notificationId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/notifications/${notificationId}`, {}, { headers: this.getHeaders() });
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/${notificationId}`, { headers: this.getHeaders() });
  }
}
