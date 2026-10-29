import { Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

export interface Channel {
  id: number;
  name: string;
  channel_id: string;
}

export interface joinBotChannelMessage{
  success: string;
}

export interface BotVoiceStatus{
  connected: boolean;
}

export interface DisconnectBot{
  detail: string;
}
@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  isLogged = signal(false);

  botInchannels = signal(false);

  constructor(private http: HttpClient) { }
//On fait la requête pour récupérer les channels de l'utilisateur
  getChannel(): Observable<Channel[]> {
    return this.http.get<Channel[]>('http://localhost:8000/api/get_channels/', 
      {withCredentials: true}
    ) 
    
  }

  joinBotVocal(): Observable<joinBotChannelMessage>{
    return this.http.post<joinBotChannelMessage>('/api/join_bot/', null, {
      withCredentials: true
    });
  }

  getBotVoiceStatus() : Observable<BotVoiceStatus> {
    return this.http.get<BotVoiceStatus>('/api/bot_voice_status/', {withCredentials: true});
  }

  disconnectBotVoice(): Observable<HttpResponse<DisconnectBot>>{
    return this.http.post<DisconnectBot>('/api/disconnect_bot/', null, {observe: 'response', withCredentials: true});
  }
}
