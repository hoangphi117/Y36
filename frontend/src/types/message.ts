export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_sender_id: string;
  last_time: string;
  unread_count: number;
}

export interface MessagesResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Message[];
}

export interface ConversationsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Conversation[];
}
