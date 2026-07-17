import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../../core/config/environment';
import { WebsocketService } from '../../../core/websocket/websocket.service';

import { GroupModel, GroupCreateRequest } from '../models/group.model';
import { GroupMessageRequest, GroupMessageResponse } from '../models/group-message.model';

@Service()
export class GroupService {
private readonly http = inject(HttpClient);
  private readonly websocket = inject(WebsocketService);
  private readonly url = environment.apiUrl;

  create(request: GroupCreateRequest): Observable<GroupModel> {
    return this.http.post<GroupModel>(`${this.url}/groups`, request);
  }

  myGroups(userId: number): Observable<GroupModel[]> {
    return this.http.get<GroupModel[]>(`${this.url}/groups`, {
      params: { userId },
    });
  }

  history(groupId: number): Observable<GroupMessageResponse[]> {
    return this.http.get<GroupMessageResponse[]>(
      `${this.url}/groups/${groupId}/messages`
    );
  }

  send(request: GroupMessageRequest): void {
    this.websocket.send('/app/group.chat', request);
  }

  listen(groupId: number): Subject<GroupMessageResponse> {
    return this.websocket.subscribeTopic<GroupMessageResponse>(
      `/topic/group.${groupId}`
    );
  }

  stopListening(groupId: number): void {
    this.websocket.unsubscribeTopic(`/topic/group.${groupId}`);
  }
}