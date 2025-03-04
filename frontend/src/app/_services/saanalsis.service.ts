import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SAanalsisService {

  constructor(private http: HttpClient) { }
  
  getAdminAnalytics(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/admin-dashboard/analytics`);
  }
}
