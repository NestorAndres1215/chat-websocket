import { ReplyPreview } from '../../chat/models/reply-preview';
import { ReactionSummary } from '../../chat/models/chat-message-response';

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
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  reactions?: ReactionSummary[];
}