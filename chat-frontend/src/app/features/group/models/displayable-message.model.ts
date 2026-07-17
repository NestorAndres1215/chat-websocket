import { ReplyPreview } from '../../chat/models/reply-preview';

export interface DisplayableMessage {
  id: number;

  userId: number;

  username: string;

  fullName: string;

  content: string;

  sentAt: string;

  recipientId?: number;

  status?: string;

  replyTo?: ReplyPreview | null;

  fileUrl?: string;

  fileName?: string;
  fileSize?: number;
  type?: string;
}