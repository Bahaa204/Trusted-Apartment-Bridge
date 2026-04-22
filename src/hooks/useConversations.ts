import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import type { Conversation } from "@/types/chat";
import type { Data } from "@/types/types";

/**
 * Custom hook to manage conversations data and operations.
 * @returns An object containing the list of conversations, loading state, error message, and functions to manage conversations
 */
export function useConversations() {
  const [Conversations, setConversations] = useState<Conversation[]>([]);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  function ResetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `Operation failed. Error Code: ${error.code}, Error message: ${error.message}`;
    console.error(error);
    console.log("ErrorCode: ", error.code);
    setError(msg);
    setLoading(false);
  }

  function SetMessageError(message: string) {
    setError(message);
    setLoading(false);
  }

  useEffect(() => {
    async function FetchConversations() {
      ResetStates();

      const { data, error: FetchError } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("status", "open")
        .order("updated_at", { ascending: false });

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setConversations(data ?? []);
      setLoading(false);
    }

    FetchConversations();

    const channel = supabaseClient
      .channel("all-conversations-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        FetchConversations,
      )
      .subscribe((status) => {
        console.log("Conversations channel:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  async function getConversation(customerToken: string) {
    const { data, error: FetchError } = (await supabaseClient
      .from("conversations")
      .select("*")
      .eq("customer_token", customerToken)
      .eq("status", "open")
      .single()) as Data<Conversation>;

    // PGRST116 is expected for a new user
    if (FetchError && FetchError.code !== "PGRST116") {
      SetError(FetchError);
      return null;
    }
    return data;
  }

  async function StartConversation(
    customerToken: string,
    customerName: string,
  ): Promise<Conversation | null> {
    ResetStates();

    // Resume existing open conversation if any
    const existing = await getConversation(customerToken);

    if (existing) {
      setLoading(false);
      return existing;
    }

    // start a new conversation
    const { data, error: InsertError } = await supabaseClient
      .from("conversations")
      .insert({ customer_token: customerToken, customer_name: customerName })
      .select("*")
      .single();

    if (InsertError) {
      SetError(InsertError);
      return null;
    }

    setLoading(false);
    return data;
  }

  async function CloseConversation(conversationId: string) {
    ResetStates();

    const { error: DeleteMessagesError } = await supabaseClient
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (DeleteMessagesError) {
      SetError(DeleteMessagesError);
      return false;
    }

    const { data: DeletedConversations, error: DeleteConversationError } =
      await supabaseClient
        .from("conversations")
        .delete()
        .eq("id", conversationId)
        .select("id");

    if (DeleteConversationError) {
      SetError(DeleteConversationError);
      return false;
    }

    if (!DeletedConversations || DeletedConversations.length === 0) {
      SetMessageError(
        "Close failed: conversation was not deleted. Check Supabase RLS delete policies for conversations/messages.",
      );
      return false;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    setLoading(false);
    return true;
  }

  async function BumpConversation(conversationId: string) {
    const { error: UpdateError } = await supabaseClient
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (UpdateError) {
      SetError(UpdateError);
      return false;
    }

    return true;
  }

  return {
    Conversations,
    Loading,
    Error,
    StartConversation,
    CloseConversation,
    BumpConversation,
    getConversation,
  };
}
