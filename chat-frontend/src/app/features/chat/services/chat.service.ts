import { Observable } from 'rxjs';
import { inject } from '@angular/core';

import { ApiService } from '../../../core/http/api.service';

import { WebsocketService } from '../../../core/websocket/websocket.service';

import { ChatMessageRequest } from '../models/chat-message-request';

import { ChatMessageResponse } from '../models/chat-message-response';
import { Service } from '@angular/core';
import { environment } from '../../../core/config/environment';
import { HttpClient } from '@angular/common/http';

@Service()
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly websocket = inject(WebsocketService);
  private readonly url = environment.apiUrl;

  connect(): void {
    this.websocket.connect();
  }

  disconnect(): void {
    this.websocket.disconnect();
  }

  messages(): Observable<ChatMessageResponse> {
    return this.websocket.messages$;
  }

  errors(): Observable<string> {
    return this.websocket.errors$;
  }

  send(request: ChatMessageRequest): void {
    this.websocket.send('/app/chat', request);
  }

  history(): Observable<ChatMessageResponse[]> {
    return this.http.get<ChatMessageResponse[]>(`${this.url}/messages`);
  }

  conversation(userA: number, userB: number): Observable<ChatMessageResponse[]> {
    return this.http.get<ChatMessageResponse[]>(
      `${this.url}/messages/conversation`,
      { params: { userA, userB } }
    );
  }

}
