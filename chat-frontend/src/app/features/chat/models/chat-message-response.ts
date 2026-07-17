import { ReplyPreview } from './reply-preview';

export interface ChatMessageResponse {
  id: number;

  userId: number;

  username: string;

  fullName: string;

  recipientId: number;

  content: string;

  sentAt: string;

  status: string;

  replyTo: ReplyPreview | null;

  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
}
