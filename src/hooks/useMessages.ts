import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import type { Message, SendMessageParams } from "@/types/chat";

/**
 * A custom hook for fetching and listening to messages in a specific conversation.
 * @param conversationId - The ID of the conversation for which to fetch and listen to messages.
 * @returns An object containing the messages, loading state, and error state.
 */
export function useMessages(conversationId: string | undefined | null) {
  const [Messages, setMessages] = useState<Message[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");

  function ResetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `Operation failed. Error message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    if (!conversationId) return;

    async function FetchMessages() {
      ResetStates();
      const { data, error: FetchError } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setMessages(data ?? []);
      setLoading(false);
    }

    FetchMessages();

    const channel = supabaseClient
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) =>
          setMessages((prev) => {
            const newMessage = payload.new as Message;
            if (prev.some((message) => message.id === newMessage.id)) {
              return prev;
            }

            return [...prev, newMessage];
          }),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) =>
          setMessages((prev) => {
            const updatedMessage = payload.new as Message;

            return prev.map((message) =>
              message.id === updatedMessage.id ? updatedMessage : message,
            );
          }),
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) =>
          setMessages((prev) => {
            const deletedMessage = payload.old as Message;

            return prev.filter((message) => message.id !== deletedMessage.id);
          }),
      )
      .subscribe((status) => {
        console.log(`Messages ${conversationId} channel:`, status);

        if (status === "CHANNEL_ERROR") {
          setError(
            "Realtime channel error for messages. Check Realtime replication and RLS SELECT policies.",
          );
          setLoading(false);
        }
      });

    return () => {
      supabaseClient.removeChannel(channel);
      setMessages([]);
    };
  }, [conversationId]);

  /**
   * Sends a new message to the specified conversation.
   * @param param0 - An object containing the parameters for sending a message, including sender type, sender ID, message content, and an optional callback to execute after sending.
   * @returns A promise resolving to a boolean.
   */
  async function SendMessage({
    senderType,
    senderId,
    content,
    onAfterSend,
  }: SendMessageParams){
    if (!content.trim() || !conversationId) return false;

    const { error: InsertError } = await supabaseClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type: senderType,
        sender_id: senderId,
        content: content.trim(),
      });

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    onAfterSend?.();
    return true;
  }

  return {
    Messages,
    Loading,
    Error,
    SendMessage,
  };
}
