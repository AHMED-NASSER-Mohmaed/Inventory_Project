import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OnproductsService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/getAllOnlineProductInfo?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deactivateProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/delete/${id}`, { headers: this.getHeaders() });
  }

  activateProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/product/active/${id}`, {}, { headers: this.getHeaders() });
  }

  approveProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/approveProduct/${id}`, {}, { headers: this.getHeaders() });
  }

  rejectProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/rejectProduct/${id}`, {}, { headers: this.getHeaders() });
  }

  activateSellerProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activeOnProduct/${id}`, {}, { headers: this.getHeaders() });
  }

  deactivateSellerProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deActiveOnProduct/${id}`, { headers: this.getHeaders() });
  }

  searchProducts(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/getAllOnlineProductInfo?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }

  updateProductData(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/product/data/update/${productId}`, data, { headers: this.getHeaders() });
  }

  updateProductImages(productId: string, deletedImageIds: string[], newImages?: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('deletedImages', JSON.stringify(deletedImageIds));
    
    if (newImages && newImages.length > 0) {
      newImages.forEach(file => {
        formData.append('image', file);
      });
    }
    
    const headers = this.getHeaders();
    headers.delete('Content-Type');
    return this.http.patch(`${this.baseUrl}/product/Images/update/${productId}`, formData, { headers });
  }

  deleteProductImage(productId: string, imageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/Images/delete/${productId}/${imageId}`, { headers: this.getHeaders() });
  }

}
