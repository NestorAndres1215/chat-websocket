import { ReplyPreview } from "../../chat/models/reply-preview";

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
  userId: number;
  username: string;
  fullName: string;
  content: string;
  sentAt: string;
  status?: string;
  replyTo?: ReplyPreview | null;
  fileUrl?: string;
  fileName?: string;
  type?: string;
}