import { inject, PLATFORM_ID, Service } from '@angular/core';
import { UserModel } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/config/environment';

@Service()
export class UserService {
  private readonly key = 'chat_user';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  save(user: UserModel): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.key, JSON.stringify(user));
    }
  }

  get(): UserModel | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const data = localStorage.getItem(this.key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  remove(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.key);
    }
  }

  online(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.url}/users`);
  }

  search(username: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.url}/users/search`, {
      params: { username },
    });
  }
}
