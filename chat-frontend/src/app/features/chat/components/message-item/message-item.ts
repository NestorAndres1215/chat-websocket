import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisplayableMessage } from '../../../group/models/displayable-message.model';

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

  onReply(): void {
    this.reply.emit(this.message);
  }

}