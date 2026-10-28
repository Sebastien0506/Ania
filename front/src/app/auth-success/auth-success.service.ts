import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthSuccessService {

  constructor(private http: HttpClient) { }

  //On fait la requête pour récupérer le jeton csrf
  getCsrf(){
    return this.http.get('/api/get_csrf/', {withCredentials: true});
  }
}
