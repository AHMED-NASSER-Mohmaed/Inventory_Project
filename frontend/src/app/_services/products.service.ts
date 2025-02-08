import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../_models/products';
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http:HttpClient) {
    
   }

   private url:string="http://localhost:3000/products"

  

   getAll():Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  getBycategory(id :string ):Observable<Product[]> {
    return this.http.get<Product[]>(this.url+"/"+id);
  }

}



