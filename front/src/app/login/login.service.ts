import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  id : number;
  username: string;
  avatar_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) { }

  loginWithDiscord(): void {
    window.location.href = 'http://localhost:8000/auth/discord/login/';
  }

  //On fait la requête pour récupérer l'utilisateur
  getUser(): Observable<User> {
    return this.http.get<User>("http://localhost:8000/api/me/", {
      withCredentials: true
    })
  }
}
