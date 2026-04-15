import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import type { Message, SendMessageParams } from "@/types/chat";

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
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]),
      )
      .subscribe((status) => {
        console.log(`Messages ${conversationId} channel:`, status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
      setMessages([]);
    };
  }, [conversationId]);

  async function SendMessage({
    senderType,
    senderId,
    content,
    onAfterSend,
  }: SendMessageParams): Promise<boolean> {
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
