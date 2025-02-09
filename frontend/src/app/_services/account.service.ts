import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AccountService {

  constructor(public http: HttpClient) { 
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.userType = localStorage.getItem('userType') || '';
  }


  login(email: string, password: string) : Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/login', { email, password });
  }

  signupForCustomer(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, passwordConfirm: string , userType: string): Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/signup', { firstName, lastName, email, phoneNumber, password, passwordConfirm , userType });
  }

  signupForSeller(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, passwordConfirm: string , userType: string, SSN: string , companyRegistrationNumber: string , companyName: string): Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/signup', { firstName, lastName, email, phoneNumber, password, passwordConfirm , userType , SSN , companyRegistrationNumber , companyName });
  }

  isLoggedIn: boolean;
  userType: string;

  setLoginStatus(){
    this.isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
  }

  setUserType(type: string) {
    this.userType = type;
    localStorage.setItem('userType', type);
  }

  showLoginStatus() {
    console.log(this.isLoggedIn);
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
  }





}
