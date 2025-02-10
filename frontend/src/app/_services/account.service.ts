import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private _isLoggedIn = false;
  private _userType: string | null = null;

  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  set isLoggedIn(value: boolean) {
    this._isLoggedIn = value;
  }

  get userType(): string | null {
    return this._userType;
  }

  set userType(value: string | null) {
    this._userType = value;
  }

  constructor(public http: HttpClient) { 
    // Removed localStorage initialization.
  }

  login(email: string, password: string) : Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/login', { email, password });
  }

  signupForCustomer(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, passwordConfirm: string, userType: string): Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/signup', { firstName, lastName, email, phoneNumber, password, passwordConfirm, userType });
  }

  signupForSeller(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, passwordConfirm: string, userType: string, SSN: string, companyRegistrationNumber: string, companyName: string): Observable<any> {
    return this.http.post('http://127.0.0.1:3000/auth/signup', { firstName, lastName, email, phoneNumber, password, passwordConfirm, userType, SSN, companyRegistrationNumber, companyName });
  }

  setLoginStatus(){
    this.isLoggedIn = true;
    // Removed localStorage update.
  }

  setUserType(type: string) {
    this.userType = type;
    // Removed localStorage update.
  }

  showLoginStatus() {
    console.log(this.isLoggedIn);
  }

  logout() {
    this.isLoggedIn = false;
    this.userType = '';
    // Removed localStorage cleanup.
  }
}
