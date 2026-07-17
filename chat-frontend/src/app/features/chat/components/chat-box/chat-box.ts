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
  imports: [FormsModule, CommonModule, MessageItem],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        this.messages.update((current) => {
          const exists = current.some((m) => m.id === message.id);

          if (exists) {
            return current.map((m) => (m.id === message.id ? message : m));
          }

          return [...current, message];
        });

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

  // ACTUALIZADO: sube el archivo por HTTP primero, luego manda el mensaje por WS
  send(): void {
    const recipient = this.selectedRecipient();

    if (!this.user || !recipient) {
      return;
    }

    if (!this.content.trim() && !this.selectedFile) {
      return;
    }

    if (this.selectedFile) {
      this.chatService.uploadFile(this.selectedFile).subscribe({
        next: ({ fileUrl, fileName }) => {
          this.emitMessage(recipient.id, fileUrl, fileName, 'FILE');
        },
        error: (error) => {
          console.error('Error subiendo archivo', error);
        },
      });
    } else {
      this.emitMessage(recipient.id, undefined, undefined, 'TEXT');
    }
  }

  private emitMessage(
    recipientId: number,
    fileUrl?: string,
    fileName?: string,
    type?: string,
  ): void {
    if (!this.user) {
      return;
    }

    this.chatService.send({
      userId: this.user.id,
      recipientId,
      content: this.content,
      replyToId: this.replyingTo()?.id,
      fileUrl,
      fileName,
      type,
    });

    this.content = '';
    this.selectedFile = undefined;
    this.replyingTo.set(null);

    this.chatService.sendTyping({
      senderId: this.user.id,
      receiverId: recipientId,
      typing: false,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showEmojiPicker = signal(false);

  private cdr = inject(ChangeDetectorRef);

  onEmojiClick(event: any): void {
    const emoji = event.detail?.unicode ?? '';
    this.content += emoji;
    this.showEmojiPicker.set(false);
    this.sendTyping();
    this.cdr.detectChanges();
  }

  closingEmojiPicker = signal(false);

  toggleEmojiPicker(): void {
    if (this.showEmojiPicker()) {
      this.closingEmojiPicker.set(true);
      setTimeout(() => {
        this.showEmojiPicker.set(false);
        this.closingEmojiPicker.set(false);
      }, 180);
    } else {
      this.showEmojiPicker.set(true);
    }
  }

  selectedFile?: File;

  // ACTUALIZADO: ya no lee el archivo como base64, solo lo guarda para subirlo después
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile = input.files[0];
  }
}