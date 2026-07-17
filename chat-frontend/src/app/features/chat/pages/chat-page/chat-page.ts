import { Component, signal } from '@angular/core';

import { ChatBox } from '../../components/chat-box/chat-box';
import { UserList } from '../../../user/pages/user-list/user-list';
import { UserService } from '../../../user/services/user.service';
import { GroupModel } from '../../../group/models/group.model';
import { GroupList } from '../../../group/pages/group-list/group-list';
import { GroupChat } from '../../../group/pages/group-chat/group-chat';

@Component({
  selector: 'app-chat-page',

  standalone: true,

  imports: [ChatBox, GroupList, GroupChat],

  templateUrl: './chat-page.html',

  styleUrl: './chat-page.css',
})
export class ChatPage {
  private userService = new UserService(); 

  activeTab = signal<'private' | 'groups'>('private');

  activeGroup = signal<GroupModel | null>(null);

  get currentUserId(): number {
    return this.userService.get()?.id ?? 0;
  }

  setTab(tab: 'private' | 'groups'): void {
    this.activeTab.set(tab);
  }

  onSelectGroup(group: GroupModel): void {
    this.activeGroup.set(group);
  }
}
