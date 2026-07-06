import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Channel {
  id: number;
  name: string;
  channel_id: string;
}
@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  constructor(private http: HttpClient) { }
//On fait la requête pour récupérer les channels de l'utilisateur
  getChannel(): Observable<Channel[]> {
    return this.http.get<Channel[]>('http://localhost:8000/api/get_channels/', 
      {withCredentials: true}
    ) 
    
  }
}
