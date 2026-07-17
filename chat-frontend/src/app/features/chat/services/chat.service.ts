import { Observable } from 'rxjs';
import { inject } from '@angular/core';

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
    return this.http.get<ChatMessageResponse[]>(`${this.url}/messages/conversation`, {
      params: {
        userA,
        userB,
      },
    });
  }

  typing(): Observable<any> {
    return this.websocket.typing$;
  }

  sendTyping(data: any): void {
    this.websocket.send('/app/typing', data);
  }

  markAsRead(senderId: number, recipientId: number): Observable<void> {
    return this.http.put<void>(
      `${this.url}/messages/status`,
      {},
      {
        params: {
          senderId,
          recipientId,
          status: 'LEIDO',
        },
      },
    );
  }

  uploadFile(file: File): Observable<{ fileUrl: string; fileName: string; fileSize: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ fileUrl: string; fileName: string; fileSize: number }>(
      `${this.url}/upload`,
      formData,
    );
  }

  editMessage(messageId: number, userId: number, content: string): Observable<ChatMessageResponse> {
    return this.http.put<ChatMessageResponse>(`${this.url}/messages/${messageId}`, {
      userId,
      content,
    });
  }

  deleteMessage(messageId: number, userId: number): Observable<ChatMessageResponse> {
    return this.http.delete<ChatMessageResponse>(`${this.url}/messages/${messageId}`, {
      params: { userId },
    });
  }
}
