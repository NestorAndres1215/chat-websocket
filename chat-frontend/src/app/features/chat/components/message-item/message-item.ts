import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DisplayableMessage } from '../../../group/models/displayable-message.model';
import { environment } from '../../../../core/config/environment';
import { ChatService } from '../../services/chat.service';
import 'emoji-picker-element';
type FileKind = 'image' | 'pdf' | 'word' | 'excel' | 'generic';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-item.html',
  styleUrl: './message-item.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  // --- Reacciones ---

  showReactionPicker = signal(false);

  toggleReactionPicker(): void {
    this.showReactionPicker.update((v) => !v);
  }

  closeReactionPicker(): void {
    this.showReactionPicker.set(false);
  }

  reactions = computed(() => {
    const list = this.message.reactions ?? [];
    return list.map((r) => ({
      ...r,
      reactedByMe: r.userIds.includes(this.currentUserId),
    }));
  });

  onReactionEmojiClick(event: any): void {
    const emoji = event.detail?.unicode ?? '';
    if (!emoji) return;
    this.react(emoji);
  }

  react(emoji: string): void {
    this.chatService.react(this.message.id, this.currentUserId, emoji).subscribe({
      error: (error) => {
        console.error('Error reaccionando al mensaje', error);
      },
    });
    this.closeReactionPicker();
  }

  reactionPickerPosition = signal({ top: 0, left: 0, width: 320, height: 400 });
  openReactionPickerFromMenu(event: MouseEvent): void {
    this.closeMenu();
    this.setReactionPickerPosition(event);
    this.showReactionPicker.set(true);
  }
  private setReactionPickerPosition(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const minWidth = 320;
    const maxWidth = 420;
    const maxHeight = 400;
    const minHeight = 280;
    const margin = 12;

    // --- ancho ---
    const spaceRight = window.innerWidth - rect.left - margin;
    const spaceLeft = rect.right - margin;

    let width: number;
    let left: number;

    if (spaceRight >= minWidth) {
      width = Math.min(maxWidth, spaceRight);
      left = rect.left;
    } else if (spaceLeft >= minWidth) {
      width = Math.min(maxWidth, spaceLeft);
      left = rect.right - width;
    } else {
      width = Math.max(spaceRight, spaceLeft, 260);
      left = spaceRight >= spaceLeft ? rect.left : margin;
    }

    // --- alto: elegimos abrir hacia abajo o hacia arriba según dónde haya más lugar ---
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    let height: number;
    let top: number;

    if (spaceBelow >= minHeight || spaceBelow >= spaceAbove) {
      // abre hacia abajo, recortando la altura al espacio real disponible
      height = Math.max(minHeight, Math.min(maxHeight, spaceBelow));
      top = rect.bottom + 8;

      // por si acaso se pasa igual, lo clampeamos contra el borde inferior
      if (top + height > window.innerHeight - margin) {
        height = window.innerHeight - margin - top;
      }
    } else {
      // abre hacia arriba
      height = Math.max(minHeight, Math.min(maxHeight, spaceAbove));
      top = rect.top - height - 8;

      if (top < margin) {
        top = margin;
        height = rect.top - margin - 8;
      }
    }

    this.reactionPickerPosition.set({ top, left, width, height });
  }
  togglePin(): void {
    this.closeMenu();
    this.chatService.togglePin(this.message.id, this.currentUserId).subscribe({
      error: (error) => {
        console.error('Error fijando mensaje', error);
      },
    });
  }
}
