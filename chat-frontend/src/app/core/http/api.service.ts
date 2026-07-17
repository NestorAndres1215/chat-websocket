import { inject, Service } from '@angular/core';
import { environment } from '../config/environment';
import { HttpClient } from '@angular/common/http';

@Service()
export class ApiService {

  private readonly url = environment.apiUrl;
  private readonly http = inject(HttpClient);

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.url}/${endpoint}`);
  }

  post<T>(endpoint: string, body: any) {
    return this.http.post<T>(`${this.url}/${endpoint}`, body);
  }
}
