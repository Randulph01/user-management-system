import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '../_models/account';

const baseUrl = `${environment.apiUrl}`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  constructor(private router: Router, private http: HttpClient) {
    this.accountSubject = new BehaviorSubject<Account | null>(null);
    this.account = this.accountSubject.asObservable(); 
  }
  
  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }
  
  login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/accounts/authenticate`, { email, password }, { withCredentials: true })
      .pipe(map(account => {
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  logout() {
    this.http.post<any>(`${baseUrl}/accounts/revoke-token`, {}, { withCredentials: true }).subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/accounts/login']);
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/accounts/refresh-token`, {}, { withCredentials: true })
      .pipe(map((account) => {
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/accounts/register`, account);
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/accounts/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/accounts/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/accounts/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/accounts/reset-password`, { token, password, confirmPassword });
  }

getAll() {
  return this.http.get<Account[]>(`${baseUrl}/accounts`); // Append '/accounts' to the base URL
}

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/accounts/${id}`);
  }

  create(params: any) {
    return this.http.post(`${baseUrl}/accounts`, params);
  }

  update(id:string, params:object) {
    return this.http.put(`${baseUrl}/accounts/${id}`, params)
      .pipe(map((account: any) => {
        if (account.id === this.accountValue?.id) {
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/accounts/${id}`)
      .pipe(finalize(() => {
        if (id === String(this.accountValue?.id)) {
          this.logout();
        }
      }));
  }

  private refreshTokenTimeout: any;

  private startRefreshTokenTimer() {
    const jwtToken = this.accountValue?.jwtToken
    ? JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]))
    : null;

    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}