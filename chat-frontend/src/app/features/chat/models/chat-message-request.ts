export interface ChatMessageRequest {
  userId: number;
  recipientId: number;
  content: string;
  replyToId?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?:number;
  type?: string;
}