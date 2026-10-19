import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Message {
  author: string;
  content: string;
  discord_created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  constructor(private http: HttpClient) {}

  syncChannel(channelId: string) {
    return this.http.post(
      `/api/trigger_sync/${channelId}/`,
      {},
      { withCredentials: true }
    );
  }

  getMessage(channelId: string) {
    return this.http.get<Message[]>(
      `/api/get_message/${channelId}/`,
      { withCredentials: true }
    );
  }

  sendMessage(message: string) {
    return this.http.post(
      `/api/on_message/`,
      { message },
      { withCredentials: true }
    );
  }
}
