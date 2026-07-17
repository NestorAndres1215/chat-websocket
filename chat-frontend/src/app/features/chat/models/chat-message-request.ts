export interface ChatMessageRequest {
  userId: number;
  recipientId: number;
  content: string;
  replyToId?: number;
}