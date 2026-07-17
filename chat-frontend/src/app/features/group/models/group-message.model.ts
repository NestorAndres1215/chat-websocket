export interface GroupReplyPreview {
  id: number;
  username: string;
  content: string;
}

export interface GroupMessageRequest {
  groupId: number;
  userId: number;
  content: string;
  replyToId?: number;
}

export interface GroupMessageResponse {
  id: number;
  groupId: number;
  userId: number;
  username: string;
  fullName: string;
  content: string;
  sentAt: string;
  replyTo: GroupReplyPreview | null;
}