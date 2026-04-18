/**
 * This file defines the types for the chat data used in the application.
 */

export type Conversation = {
  id: string;
  customer_token: string;
  customer_name: string | null;
  status: "open" | "closed";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "employee" | "admin";
  sender_id: string;
  content: string;
  created_at: string;
};

export type SendMessageParams = {
  senderType: Message["sender_type"];
  senderId: string;
  content: string;
  onAfterSend?: () => void;
};
