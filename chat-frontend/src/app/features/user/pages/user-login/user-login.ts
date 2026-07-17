import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-login',

  standalone: true,

  imports: [FormsModule],

  templateUrl: './user-login.html',

  styleUrl: './user-login.css',
})
export class UserLogin {

  username = '';

  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  login() {

    if (!this.username.trim()) {
      return;
    }

    this.errorMessage = '';

    this.userService.search(this.username.trim()).subscribe({
      next: (users) => {

        const found = users.find(
          (u) => u.username.toLowerCase() === this.username.trim().toLowerCase()
        );

        if (!found) {
          this.errorMessage = 'Usuario no encontrado.';
          return;
        }
console.log(found)
        this.userService.save(found);

        this.router.navigate(['/chat']);

      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al buscar usuario.';
      },
    });

  }

}