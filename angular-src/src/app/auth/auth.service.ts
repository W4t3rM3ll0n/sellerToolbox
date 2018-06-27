import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  jwtToken: string;
  // user: object; I dont think this is needed. Delete if there are no errors. 06/11/18

  constructor(
    private http: Http
  ) { }

  // Load the JWT token that is stored in local storage when a user is logged in.
  // The token is used to authenticate the specific route on the server. Once authenticated the server has all the user information.
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.jwtToken = token;
  }

  registerUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/register', user, { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  authenticateUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/authenticate', user, { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  getProfile() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/users/profile', { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  storeUserData(token, user) {
    localStorage.setItem('id_token', token);
    this.jwtToken = token;
  }

  updateUser(updateUser) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/users/update', { updateUser: updateUser }, { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  updatePassword(updatePassword) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/users/updatepw', { passwords: updatePassword}, { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  deleteUser() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.delete('http://localhost:3000/users/deleteUser', { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  isAuthenticated() {
    // Auth Guard
    this.loadToken();
    return this.jwtToken !== null
  }

  logout() {
    this.jwtToken = null;
    localStorage.clear();
  }

}
