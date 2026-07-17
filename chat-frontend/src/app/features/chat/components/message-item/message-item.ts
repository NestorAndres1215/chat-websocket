import { Component, computed, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DisplayableMessage } from '../../../group/models/displayable-message.model';
import { environment } from '../../../../core/config/environment';
import { ChatService } from '../../services/chat.service';

type FileKind = 'image' | 'pdf' | 'word' | 'excel' | 'generic';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-item.html',
  styleUrl: './message-item.css',
})
export class MessageItem {
  private readonly chatService = inject(ChatService);

  @Input()
  set message(value: DisplayableMessage) {
    this._message.set(value);
  }

  get message(): DisplayableMessage {
    return this._message();
  }

  private _message = signal<DisplayableMessage>({} as DisplayableMessage);

  @Input()
  set currentUserId(value: number) {
    this._currentUserId.set(value);
  }

  get currentUserId(): number {
    return this._currentUserId();
  }

  private _currentUserId = signal<number>(0);

  @Output()
  reply = new EventEmitter<DisplayableMessage>();

  isOwn = computed(() => {
    return this.message.userId === this.currentUserId;
  });

  isDeleted = computed(() => !!this.message.deleted);

  hasFile = computed(() => {
    return !!this.message.fileUrl && !this.isDeleted();
  });

  private extension = computed(() => {
    const name = this.message.fileName ?? this.message.fileUrl ?? '';
    const match = name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
  });

  fileKind = computed<FileKind>(() => {
    const ext = this.extension();

    if (/^(jpg|jpeg|png|gif|webp|bmp)$/.test(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (/^(doc|docx)$/.test(ext)) return 'word';
    if (/^(xls|xlsx|csv)$/.test(ext)) return 'excel';
    return 'generic';
  });

  isImage = computed(() => this.fileKind() === 'image');

  fullFileUrl = computed(() => {
    const url = this.message.fileUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseHost = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseHost}${url}`;
  });

  extensionLabel = computed(() => this.extension().toUpperCase());

  fileSizeLabel = computed(() => {
    const size = this.message.fileSize;
    if (!size || size <= 0) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} kB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  });

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onDownload(): void {
    const link = document.createElement('a');
    link.href = this.fullFileUrl();
    link.download = this.message.fileName ?? 'archivo';
    link.target = '_blank';
    link.click();
  }

  // --- Menú de opciones (responder / editar / eliminar) ---

  showMenu = signal(false);

  toggleMenu(): void {
    this.showMenu.update((v) => !v);
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  onReplyClick(): void {
    this.reply.emit(this.message);
    this.closeMenu();
  }

  // --- Edición ---

  isEditing = signal(false);
  editContent = '';

  startEdit(): void {
    this.editContent = this.message.content;
    this.isEditing.set(true);
    this.closeMenu();
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editContent = '';
  }

  confirmEdit(): void {
    const newContent = this.editContent.trim();

    if (!newContent || newContent === this.message.content) {
      this.cancelEdit();
      return;
    }

    this.chatService.editMessage(this.message.id, this.currentUserId, newContent).subscribe({
      next: () => {
        this.isEditing.set(false);
      },
      error: (error) => {
        console.error('Error editando mensaje', error);
      },
    });
  }

  // --- Eliminación (soft delete) ---

  confirmDelete(): void {
    this.closeMenu();

    const confirmed = window.confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.');

    if (!confirmed) {
      return;
    }

    this.chatService.deleteMessage(this.message.id, this.currentUserId).subscribe({
      error: (error) => {
        console.error('Error eliminando mensaje', error);
      },
    });
  }

  // --- Helpers para el archivo dentro del reply-preview ---

  private replyExtension = computed(() => {
    const name = this.message.replyTo?.fileName ?? this.message.replyTo?.fileUrl ?? '';
    const match = name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
  });

  replyHasFile = computed(() => !!this.message.replyTo?.fileUrl);

  replyIsImage = computed(() => {
    return /^(jpg|jpeg|png|gif|webp|bmp)$/.test(this.replyExtension());
  });

  replyFullFileUrl = computed(() => {
    const url = this.message.replyTo?.fileUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseHost = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseHost}${url}`;
  });
}
