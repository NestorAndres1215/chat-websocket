import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/user/pages/user-login/user-login').then((m) => m.UserLogin),
  },

  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page').then((m) => m.ChatPage),
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
