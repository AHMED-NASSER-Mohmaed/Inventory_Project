import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffproductService {

  constructor(public http: HttpClient) { }
  private baseUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPaginatedProducts(page: number, limit: number, filters?: string, sort?: string): Observable<any> {
    const filterParam = filters ? `filters=${filters}` : '';
    const url = `${this.baseUrl}/OffProduct?${filterParam}${filterParam ? '&' : ''}page=${page}&limit=${limit}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  deactivateProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/delete/${id}`, { headers: this.getHeaders() });
  }

  activateProduct(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/product/active/${id}`, {}, { headers: this.getHeaders() });
  }

  getActiveProductsCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/OffProduct/count?filters=isActive:true`, { headers: this.getHeaders() });
  }

  getInactiveProductsCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/OffProduct/count?filters=isActive:false`, { headers: this.getHeaders() });
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
    return this.http.delete(`${this.baseUrl}/product/Images/delete/${imageId}`, { headers: this.getHeaders() });
  }

  updateProductData(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/product/data/update/${productId}`, data, { headers: this.getHeaders() });
  }

  searchProducts(filters: string, page: number, limit: number, sort?: string): Observable<any> {
    const url = `${this.baseUrl}/OffProduct?page=${page}&limit=${limit}&filters=${filters}${sort || ''}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  addProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/OffProduct`, data, { headers: this.getHeaders() });
  }

  getMappedBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches/maped`, { headers: this.getHeaders() });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/AllActive/idN`, { headers: this.getHeaders() });
  }

  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands/Allactive/idN`, { headers: this.getHeaders() });
  }

  getAllSuppliers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/suppliers/IdsNames`, { headers: this.getHeaders() });
  }

  updateProductStock(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/OffProduct/updateQty/${productId}/${quantity}`, {}, { headers: this.getHeaders() });
  }

  exportProduct(productId: string, sourceId: string, destinationId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/OffProduct/exportTo?id=${productId}&src=${sourceId}&dest=${destinationId}&qty=${quantity}`, {}, { headers: this.getHeaders() });
  }
}
