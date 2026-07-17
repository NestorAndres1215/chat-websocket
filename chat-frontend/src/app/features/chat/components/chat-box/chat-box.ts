import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { ChatService } from '../../services/chat.service';

import { ChatMessageResponse } from '../../models/chat-message-response';

import { MessageItem } from '../message-item/message-item';

import { UserService } from '../../../user/services/user.service';

import { UserModel } from '../../../user/models/user.model';
import { DisplayableMessage } from '../../../group/models/displayable-message.model';

@Component({
  selector: 'app-chat-box',

  standalone: true,

  imports: [FormsModule, MessageItem],

  templateUrl: './chat-box.html',

  styleUrl: './chat-box.css',
})
export class ChatBox implements OnInit, OnDestroy {
  messages = signal<ChatMessageResponse[]>([]);

  onlineUsers = signal<UserModel[]>([]);

  selectedRecipient = signal<UserModel | null>(null);

  replyingTo = signal<DisplayableMessage | null>(null);

  content = '';

  // Usuario conectado
  user!: UserModel | null;

  private subscriptions = new Subscription();

  visibleMessages = computed(() => {

    const recipient = this.selectedRecipient();
    const me = this.user?.id ?? 0;

    if (!recipient) {
      return [];
    }

    return this.messages().filter((m) =>
      (m.userId === me && m.recipientId === recipient.id) ||
      (m.userId === recipient.id && m.recipientId === me)
    );

  });

  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  
  }

  ngOnInit(): void {
    // Obtener usuario del localStorage

    this.user = this.userService.get();

    console.log('Usuario conectado:', this.user);

    if (!this.user) {
      console.error('No existe usuario');

      return;
    }

    // Conectar WebSocket

    this.chatService.connect();

    // Cargar historial

    this.chatService.history().subscribe({
      next: (data) => {
        console.log(data)
        this.messages.set(data);
      },

      error: (err) => {
        console.error(err);
      },
    });

    // Escuchar mensajes nuevos

    this.subscriptions.add(
      this.chatService.messages().subscribe({
        next: (message) => {
          console.log(message)
          this.messages.update((current) => [...current, message]);
        },

        error: (err) => {
          console.error(err);
        },
      })
    );

    // Escuchar errores del servidor

    this.subscriptions.add(
      this.chatService.errors().subscribe({
        next: (error) => {
          console.error('Error del servidor:', error);
        },
      })
    );

    // Cargar usuarios en línea

    this.userService.online().subscribe({
      next: (users) => {
        this.onlineUsers.set(users.filter((u) => u.id !== this.user?.id));
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  selectRecipient(recipient: UserModel): void {
    this.selectedRecipient.set(recipient);
    this.replyingTo.set(null);
  }

  startReply(message: DisplayableMessage): void {
    this.replyingTo.set(message);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
  }

  send(): void {
    if (!this.content.trim()) {
      return;
    }

    if (!this.user) {
      console.error('Usuario no encontrado');

      return;
    }

    const recipient = this.selectedRecipient();

    if (!recipient) {
      console.error('No has seleccionado destinatario');

      return;
    }

    this.chatService.send({
      userId: this.user.id,
      recipientId: recipient.id,
      content: this.content,
      replyToId: this.replyingTo()?.id,
    });

    this.content = '';
    this.replyingTo.set(null);
  }
}