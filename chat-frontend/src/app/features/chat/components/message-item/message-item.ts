import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisplayableMessage } from '../../../group/models/displayable-message.model';
import { environment } from '../../../../core/config/environment';

type FileKind = 'image' | 'pdf' | 'word' | 'excel' | 'generic';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-item.html',
  styleUrl: './message-item.css',
})
export class MessageItem {

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

  hasFile = computed(() => {
    return !!this.message.fileUrl;
  });

  private extension = computed(() => {
    const name = this.message.fileName ?? this.message.fileUrl ?? '';
    const match = name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
  });

  fileKind = computed<FileKind>(() => {
    const ext = this.extension();

    if (/^(jpg|jpeg|png|gif|webp|bmp)$/.test(ext)) {
      return 'image';
    }
    if (ext === 'pdf') {
      return 'pdf';
    }
    if (/^(doc|docx)$/.test(ext)) {
      return 'word';
    }
    if (/^(xls|xlsx|csv)$/.test(ext)) {
      return 'excel';
    }
    return 'generic';
  });

  isImage = computed(() => this.fileKind() === 'image');

  fullFileUrl = computed(() => {
    const url = this.message.fileUrl;

    if (!url) {
      return '';
    }

    if (url.startsWith('http')) {
      return url;
    }

    const baseHost = environment.apiUrl.replace(/\/api\/?$/, '');

    return `${baseHost}${url}`;
  });

  extensionLabel = computed(() => this.extension().toUpperCase());

  fileSizeLabel = computed(() => {
    const size = this.message.fileSize;

    if (!size || size <= 0) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(0)} kB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  });

  onReply(): void {
    this.reply.emit(this.message);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.error('No se pudo cargar la imagen:', this.fullFileUrl());
  }

  onDownload(): void {
    const link = document.createElement('a');
    link.href = this.fullFileUrl();
    link.download = this.message.fileName ?? 'archivo';
    link.target = '_blank';
    link.click();
  }
}