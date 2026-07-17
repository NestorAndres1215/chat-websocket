import { ReplyPreview } from '../../chat/models/reply-preview';

export interface DisplayableMessage {
  id: number;
  userId: number;
  username: string;
  content: string;
  sentAt: string;
  replyTo: ReplyPreview | null;
}