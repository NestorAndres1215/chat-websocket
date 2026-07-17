import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { ChatMessageResponse } from '../../models/chat-message-response';
import { MessageItem } from '../message-item/message-item';

import { UserService } from '../../../user/services/user.service';
import { UserModel } from '../../../user/models/user.model';
import { DisplayableMessage } from '../../../group/models/displayable-message.model';
import { CommonModule } from '@angular/common';
import 'emoji-picker-element';
@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [FormsModule, MessageItem, CommonModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <-- necesario para <emoji-picker>
})
export class ChatBox implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);

  private readonly userService = inject(UserService);

  messages = signal<ChatMessageResponse[]>([]);

  onlineUsers = signal<UserModel[]>([]);

  selectedRecipient = signal<UserModel | null>(null);

  replyingTo = signal<DisplayableMessage | null>(null);

  isTyping = signal(false);

  content = '';

  user!: UserModel | null;

  private subscriptions = new Subscription();

  visibleMessages = computed(() => {
    const recipient = this.selectedRecipient();

    const me = this.user?.id ?? 0;

    if (!recipient) {
      return [];
    }

    return this.messages().filter(
      (m) =>
        (m.userId === me && m.recipientId === recipient.id) ||
        (m.userId === recipient.id && m.recipientId === me),
    );
  });

  ngOnInit(): void {
    this.user = this.userService.get();

    if (!this.user) {
      return;
    }

    this.chatService.connect();
    this.chatService.history().subscribe((data) => {
      this.messages.set(data);
    });

    this.subscriptions.add(
      this.chatService.messages().subscribe((message) => {
        // Agregar o actualizar mensaje recibido
        this.messages.update((current) => {
          const exists = current.some((m) => m.id === message.id);

          if (exists) {
            return current.map((m) => (m.id === message.id ? message : m));
          }

          return [...current, message];
        });

        // Si estoy viendo el chat del usuario que me mandó el mensaje
        // lo marco automáticamente como LEIDO
        if (
          this.user &&
          message.recipientId === this.user.id &&
          this.selectedRecipient()?.id === message.userId &&
          message.status !== 'LEIDO'
        ) {
          this.chatService.markAsRead(message.userId, this.user.id).subscribe({
            next: () => {
              console.log('Mensaje recibido marcado como LEIDO');

              this.messages.update((messages) =>
                messages.map((m) => {
                  if (m.id === message.id) {
                    return {
                      ...m,
                      status: 'LEIDO',
                    };
                  }

                  return m;
                }),
              );
            },

            error: (error) => {
              console.error('Error actualizando leído', error);
            },
          });
        }
      }),
    );

    // ESCUCHAR ESCRIBIENDO

    this.subscriptions.add(
      this.chatService.typing().subscribe((event) => {
        const recipient = this.selectedRecipient();

        if (recipient && event.senderId === recipient.id && event.receiverId === this.user?.id) {
          this.isTyping.set(event.typing);
        }
      }),
    );

    this.subscriptions.add(
      this.chatService.errors().subscribe((error) => {
        console.error(error);
      }),
    );

    this.userService.online().subscribe((users) => {
      this.onlineUsers.set(users.filter((u) => u.id !== this.user?.id));
    });
  }

  selectRecipient(recipient: UserModel): void {
    this.selectedRecipient.set(recipient);

    this.replyingTo.set(null);

    if (!this.user) {
      return;
    }

    this.chatService.markAsRead(recipient.id, this.user.id).subscribe({
      next: () => {
        this.messages.update((messages) =>
          messages.map((message) => {
            if (message.userId === recipient.id && message.recipientId === this.user?.id) {
              return {
                ...message,
                status: 'LEIDO',
              };
            }

            return message;
          }),
        );

        console.log('Mensajes marcados como LEIDO');
      },

      error: (error) => {
        console.error('Error marcando mensajes como leídos', error);
      },
    });
  }
  sendTyping(): void {
    const recipient = this.selectedRecipient();

    if (!this.user || !recipient) {
      return;
    }

    this.chatService.sendTyping({
      senderId: this.user.id,

      receiverId: recipient.id,

      typing: true,
    });
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

    const recipient = this.selectedRecipient();

    if (!this.user || !recipient) {
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

    this.chatService.sendTyping({
      senderId: this.user.id,

      receiverId: recipient.id,

      typing: false,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showEmojiPicker = signal(false);

  // ... resto de signals igual ...


  private cdr = inject(ChangeDetectorRef);
  onEmojiClick(event: any): void {
    const emoji = event.detail?.unicode ?? '';
    this.content += emoji;
    this.showEmojiPicker.set(false);
    this.sendTyping();
    this.cdr.detectChanges(); // fuerza actualización de la vista
  }
  closingEmojiPicker = signal(false);

toggleEmojiPicker(): void {
  if (this.showEmojiPicker()) {
    this.closingEmojiPicker.set(true);
    setTimeout(() => {
      this.showEmojiPicker.set(false);
      this.closingEmojiPicker.set(false);
    }, 180); // debe coincidir con la duración de la animación de salida
  } else {
    this.showEmojiPicker.set(true);
  }
}



}
