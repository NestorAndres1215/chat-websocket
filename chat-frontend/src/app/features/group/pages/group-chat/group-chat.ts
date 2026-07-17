import { Component, inject, Input, OnChanges, OnDestroy, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GroupService } from '../../services/group.service';
import { GroupModel } from '../../models/group.model';
import { GroupMessageResponse } from '../../models/group-message.model';
import { MessageItem } from '../../../chat/components/message-item/message-item';
import { DisplayableMessage } from '../../models/displayable-message.model';

@Component({
  selector: 'app-group-chat',

  standalone: true,

  imports: [FormsModule, MessageItem],

  templateUrl: './group-chat.html',

  styleUrl: './group-chat.css',
})
export class GroupChat implements OnChanges, OnDestroy {

  private readonly groupService = inject(GroupService);

  @Input({ required: true }) group!: GroupModel | null;

  @Input({ required: true }) currentUserId!: number;

  messages = signal<GroupMessageResponse[]>([]);

  replyingTo = signal<DisplayableMessage | null>(null);

  content = '';

  private liveSubscription?: Subscription;

  private activeGroupId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['group'] && this.group) {

      if (this.activeGroupId !== null) {
        this.groupService.stopListening(this.activeGroupId);
        this.liveSubscription?.unsubscribe();
      }

      this.activeGroupId = this.group.id;
      this.replyingTo.set(null);

      this.loadHistory();
      this.listenLive();

    }

  }

  ngOnDestroy(): void {
    if (this.activeGroupId !== null) {
      this.groupService.stopListening(this.activeGroupId);
    }
    this.liveSubscription?.unsubscribe();
  }

  private loadHistory(): void {

    if (!this.group) {
      return;
    }

    this.groupService.history(this.group.id).subscribe({
      next: (history) => this.messages.set(history),
      error: (err) => console.error(err),
    });

  }

  private listenLive(): void {

    if (!this.group) {
      return;
    }

    this.liveSubscription = this.groupService.listen(this.group.id).subscribe({
      next: (message) => {
        this.messages.update((current) => [...current, message]);
      },
    });

  }

  startReply(message: DisplayableMessage): void {
    this.replyingTo.set(message);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
  }

  send(): void {

    if (!this.content.trim() || !this.group) {
      return;
    }

    this.groupService.send({
      groupId: this.group.id,
      userId: this.currentUserId,
      content: this.content.trim(),
      replyToId: this.replyingTo()?.id,
    });

    this.content = '';
    this.replyingTo.set(null);

  }

}