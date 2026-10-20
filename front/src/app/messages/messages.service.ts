import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


//On crée l'interface pour recevoir les message et leur auteur
export interface Messages {
  id: string;
  content: string;
  author: string;
}
@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  //On fait la fonction pour récupérer les messages
  getMessage(id: any): Observable<Messages[]>{
    return this.http.get<Messages[]>(`/api/get_message/${id}/`, {withCredentials: true})
  }
}
