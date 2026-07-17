import { ReplyPreview } from './reply-preview';

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  userIds: number[];
}

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

  reactions?: ReactionSummary[];
}