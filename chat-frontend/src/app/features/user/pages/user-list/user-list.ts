import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import { UserService } from '../../../user/services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  standalone: true,

  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList implements OnInit, OnDestroy {
  users = signal<UserModel[]>([]);

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userService.online().subscribe((data) => {
      this.users.set(data);
    });
  }

  ngOnDestroy() {
    console.log('SE DESTRUYO USER LIST');
  }

  openChat(user: any): void {
    this.router.navigate(['/chat'], {
      queryParams: {
        userId: user.id,
      },
    });
  }
}
