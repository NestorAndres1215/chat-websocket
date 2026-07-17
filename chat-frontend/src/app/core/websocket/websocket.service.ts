import { Service } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../config/environment';
import { Subject } from 'rxjs';
import { ChatMessageResponse } from '../../features/chat/models/chat-message-response';
import { ChatMessageRequest } from '../../features/chat/models/chat-message-request';

@Service()
export class WebsocketService {
  private client!: Client;

  private readonly messageSubject = new Subject<ChatMessageResponse>();

  private readonly typingSubject = new Subject<any>();

  private readonly errorSubject = new Subject<string>();

  readonly messages$ = this.messageSubject.asObservable();

  readonly typing$ = this.typingSubject.asObservable();

  readonly errors$ = this.errorSubject.asObservable();

  private readonly dynamicSubjects = new Map<string, Subject<any>>();

  private readonly dynamicSubscriptions = new Map<string, StompSubscription>();

  connect(): void {
    if (this.client?.active) {
      console.log('WebSocket ya conectado');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.websocketUrl),

      reconnectDelay: 5000,

      onConnect: () => {
        console.log('WebSocket conectado');

        this.subscribeMessages();

        this.subscribeTyping();
      },
    });

    this.client.activate();
  }

  private subscribeMessages(): void {

    this.client.subscribe('/topic/messages', (message: IMessage) => {
      const body: ChatMessageResponse = JSON.parse(message.body);
      this.messageSubject.next(body);
    });




  }

  private subscribeTyping(): void {
    this.client.subscribe('/topic/typing', (message: IMessage) => {
      const body = JSON.parse(message.body);
      this.typingSubject.next(body);
    });
  }

  send<T extends object>(destination: string, body: T): void {
    console.log('Enviando:', body);

    if (!this.client?.connected) {
      console.error('WebSocket no conectado');

      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  subscribeTopic<T>(topic: string): Subject<T> {
    if (this.dynamicSubjects.has(topic)) {
      return this.dynamicSubjects.get(topic)!;
    }

    const subject = new Subject<T>();

    this.dynamicSubjects.set(topic, subject);

    const trySubscribe = () => {
      if (this.client?.connected) {
        const sub = this.client.subscribe(topic, (message: IMessage) => {
          subject.next(JSON.parse(message.body));
        });

        this.dynamicSubscriptions.set(topic, sub);
      } else {
        setTimeout(trySubscribe, 300);
      }
    };

    trySubscribe();

    return subject;
  }

  unsubscribeTopic(topic: string): void {
    this.dynamicSubscriptions.get(topic)?.unsubscribe();

    this.dynamicSubscriptions.delete(topic);

    this.dynamicSubjects.delete(topic);
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
