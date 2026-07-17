import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GroupService } from '../../services/group.service';
import { GroupModel } from '../../models/group.model';
import { UserService } from '../../../user/services/user.service';
import { UserModel } from '../../../user/models/user.model';

@Component({
  selector: 'app-group-list',

  standalone: true,

  imports: [FormsModule],

  templateUrl: './group-list.html',

  styleUrl: './group-list.css',
})
export class GroupList implements OnInit {

  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);

  @Input({ required: true }) currentUserId!: number;

  @Output() selectGroup = new EventEmitter<GroupModel>();

  groups = signal<GroupModel[]>([]);

  allUsers = signal<UserModel[]>([]);

  showCreateForm = signal(false);

  newGroupName = '';

  selectedMemberIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadGroups();

    this.userService.online().subscribe({
      next: (users) => {
        this.allUsers.set(users.filter((u) => u.id !== this.currentUserId));
      },
    });
  }

  loadGroups(): void {
    this.groupService.myGroups(this.currentUserId).subscribe({
      next: (groups) => this.groups.set(groups),
      error: (err) => console.error(err),
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
  }

  toggleMember(userId: number): void {
    this.selectedMemberIds.update((set) => {
      const copy = new Set(set);
      if (copy.has(userId)) {
        copy.delete(userId);
      } else {
        copy.add(userId);
      }
      return copy;
    });
  }

  isSelected(userId: number): boolean {
    return this.selectedMemberIds().has(userId);
  }

  createGroup(): void {

    if (!this.newGroupName.trim() || this.selectedMemberIds().size === 0) {
      return;
    }

    this.groupService.create({
      name: this.newGroupName.trim(),
      createdBy: this.currentUserId,
      memberIds: Array.from(this.selectedMemberIds()),
    }).subscribe({
      next: () => {
        this.newGroupName = '';
        this.selectedMemberIds.set(new Set());
        this.showCreateForm.set(false);
        this.loadGroups();
      },
      error: (err) => console.error(err),
    });

  }

  onSelectGroup(group: GroupModel): void {
    this.selectGroup.emit(group);
  }

}