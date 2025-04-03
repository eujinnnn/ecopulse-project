import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = {
      username: username,
      password: password
    };
    return this.http.post('http://localhost:3000/api/login', loginData);
  }  

  signup(email: string, username: string, password: string, community: string): Observable<any> {
    const signupData = {
      email: email,
      username: username,
      password: password,
      community: community || 'none'
    };
  
    return this.http.post<any>('http://localhost:3000/api/signup', signupData);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getCommunity(): string | null {
    return localStorage.getItem('community');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getCurrentUser() {
    if (this.isLoggedIn()) {
      return {
        id: this.getUserId(),
        role: this.getRole(),
        community: this.getCommunity()
      };
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('community');
    localStorage.removeItem('userId');
  }
}
