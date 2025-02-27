// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Product } from '../_models/products';
// import { category } from '../_models/category';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductsService {

//   constructor(private http: HttpClient) { }

//   private CatUrl: string = "http://localhost:3000/categories/AllActive/idN";
//   private baseUrl = 'http://localhost:3000';
//   private BrandsUrl: string = "http://localhost:3000/brands/Allactive/idN";



//   private getHeaders(): HttpHeaders {
//     const token = localStorage.getItem('token');
//     return new HttpHeaders().set('Authorization', `Bearer ${token}`);
//   }


//   getAllCategories(id: string, name: string): Observable<category[]> {
  
//     return this.http.get<category[]>(this.CatUrl, { params: _id , Cname });c
//   }

//   getAllBrands(id: string, name: string): Observable<category[]> {
  
//     return this.http.get<category[]>(this.BrandsUrl, { params: _id , Cname});
//   }



//   getFeaturedProducts(): Observable<any> {
//     return this.http.get<Product[]>(`${this.baseUrl}/getProducts?limit=3`, { headers: this.getHeaders() })
//     ;
//   }



 
// getPaginatedProducts(page: number, itemsPerPage: number, sort: string, categoryId: string) {
//     const params = {
//         page: page,
//         limit: itemsPerPage,
//         sort: sort,
//         catId: categoryId,
//     };
//     return this.http.get(`${this.baseUrl}/getProducts`, { params });
// }
// }  
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../_models/products';
import { category } from '../_models/category';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private CatUrl: string = "http://localhost:3000/categories/AllActive";
  private baseUrl = 'http://localhost:3000';
  private BrandsUrl: string = "http://localhost:3000/brands/Allactive";

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllCategories(id: string, name: string): Observable<category[]> {
    const params = { _id: id, Cname: name }; 
    return this.http.get<category[]>(this.CatUrl, { headers: this.getHeaders(), params: params });
  }

  getAllBrands(id: string, name: string): Observable<category[]> {
    const params = { _id: id, Bname: name }; 
    return this.http.get<category[]>(this.BrandsUrl, { headers: this.getHeaders(), params: params });
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/getProducts?limit=3`, { headers: this.getHeaders() });
  }

  getPaginatedProducts(page: number, itemsPerPage: number, sort: string, category: string, brand:string): Observable<any> {
    const params = {
      page: page,
      limit: itemsPerPage,
      sort: sort,
      catId: categoryId,
    };
    return this.http.get(`${this.baseUrl}/getProducts`, { params, headers: this.getHeaders() });
  }
}



