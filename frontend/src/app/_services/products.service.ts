import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../_models/products';
import { category } from '../_models/category';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  private CatUrl: string = "http://localhost:3000/categories/active";
  private baseUrl = 'http://localhost:3000';
  


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllcategories(): Observable<category[]> {
    return this.http.get<category[]>(this.CatUrl);
  }

  getFeaturedProducts(): Observable<any> {
    return this.http.get<Product[]>(`${this.baseUrl}/getProducts?limit=3`, { headers: this.getHeaders() })
    ;
  }
 
  getPaginatedProducts(page: number, itemsPerPage: number, sort: string, categoryId: string,) {
    const params = {
        page: page,
        limit: itemsPerPage,
        sort: sort,
        catid: categoryId ,
        
    };
    return this.http.get(`${this.baseUrl}/getProducts`, { params });
}
}  



