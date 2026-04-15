import { useEffect, useMemo, useRef, useState } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/Input";

function getOrCreateToken() {
  let token = localStorage.getItem("chat_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("chat_token", token);
  }
  return token;
}

export default function CustomerChatWidget() {
  const [conversationId, setConversationId] = useState<
    Conversation["id"] | null
  >(null);
  const [Input, setInput] = useState<string>("");
  const [CheckingExisting, setCheckingExisting] = useState<boolean>(true);
  const [CloseNotice, setCloseNotice] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const customerToken = useMemo(
    () => Session?.user.id || getOrCreateToken(),
    [Session?.user.id],
  );

  const customerEmail =
    Session?.user.email?.trim().toLowerCase() || "customer@unknown";
  const customerDisplayName =
    Session?.user.user_metadata?.display_name?.trim() ||
    Session?.user.email?.split("@")[0] ||
    "Customer";

  const customerLabel = `Customer (${customerDisplayName})`;

  const {
    StartConversation,
    getConversation,
    BumpConversation,
    Loading: ConversationsLoading,
    Error: ConversationsError,
  } = useConversations();
  const {
    Messages,
    SendMessage,
    Loading: MessagesLoading,
    Error: MessagesError,
  } = useMessages(conversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  useEffect(() => {
    async function LoadExistingConversation() {
      if (!customerToken) {
        setCheckingExisting(false);
        return;
      }

      const existingConversation = await getConversation(customerToken);
      if (existingConversation) {
        setConversationId(existingConversation.id);
      }
      setCheckingExisting(false);
    }

    LoadExistingConversation();
  }, [customerToken, getConversation]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabaseClient
      .channel(`customer-conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        () => {
          setConversationId(null);
          setCloseNotice("An admin or employee has closed this chat.");
          window.setTimeout(() => setCloseNotice(""), 4500);
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleStart() {
    const defaultName =
      Session?.user.user_metadata?.display_name ||
      Session?.user.email?.split("@")[0] ||
      "Customer";

    const conversation = await StartConversation(customerToken, defaultName);

    if (!conversation) return;
    setConversationId(conversation.id);
  }

  async function handleSend() {
    const sent = await SendMessage({
      senderType: "customer",
      senderId: customerEmail,
      content: Input,
      onAfterSend: () => setInput(""),
    });

    if (sent && conversationId) {
      await BumpConversation(conversationId);
    }
  }

  const loading =
    AuthLoading || ConversationsLoading || MessagesLoading || CheckingExisting;
  const error = AuthError || ConversationsError || MessagesError;

  if (loading) {
    return <div className="chat-loading">Loading support chat...</div>;
  }

  if (error) {
    return <div className="chat-error">{error}</div>;
  }

  function formatMessageSender(senderType: string, senderId: string) {
    if (senderType === "customer") {
      if (customerDisplayName) {
        return `Customer (${customerDisplayName})`;
      }

      const email = senderId.includes("@") ? senderId : customerEmail;
      return `Customer (${email})`;
    }

    const role = senderType === "admin" ? "Admin" : "Employee";
    return role;
  }

  return (
    <Card className="customer-chat-shell">
      {CloseNotice ? (
        <div className="chat-notice" role="status" aria-live="polite">
          {CloseNotice}
        </div>
      ) : null}

      <CardHeader className="chat-head">
        <CardTitle>Support Chat</CardTitle>
        <CardDescription>{customerLabel}</CardDescription>
      </CardHeader>

      <CardContent>
        {!conversationId ? (
          <>
            <Card className="chat-start-state">
              <CardTitle>No support chat yet</CardTitle>
              <CardDescription>
                Start a conversation with our support team. We typically reply
                within a few minutes.
              </CardDescription>
            </Card>
            <CardFooter className="flex justify-center items-center">
              <CardAction>
                <Button
                  onClick={handleStart}
                  className="chat-primary-btn"
                  type="button"
                >
                  Start Chat
                </Button>
              </CardAction>
            </CardFooter>
          </>
        ) : (
          <>
            <Card className="chat-messages">
              {Messages.length === 0 ? (
                <CardTitle className="chat-empty-hint">
                  Send your first message and a team member will join soon.
                </CardTitle>
              ) : (
                <CardContent className="flex flex-col justify-center gap-7">
                  {Messages.map((m) => {
                    const isCustomer = m.sender_type === "customer";
                    return (
                      <div
                        key={m.id}
                        className={`chat-message-row ${isCustomer ? "mine" : "theirs"}`}
                      >
                        <Card
                          className={`chat-bubble ${isCustomer ? "mine" : "theirs"}`}
                        >
                          <div className="chat-sender-line">
                            <CardTitle>
                              {formatMessageSender(m.sender_type, m.sender_id)}
                            </CardTitle>
                          </div>
                          <CardContent>{m.content}</CardContent>
                          <p>
                            {new Date(m.created_at).toLocaleTimeString()}
                          </p>
                        </Card>
                      </div>
                    );
                  })}
                </CardContent>
              )}
              {/* Div to ensure we scroll to bottom when new messages arrive */}
              <div ref={bottomRef} />
            </Card>
          </>
        )}
      </CardContent>

      <div className="chat-input-wrap">
        <input
          value={Input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="chat-primary-btn"
          type="button"
          disabled={!Input.trim()}
        >
          Send
        </button>
      </div>
    </Card>
  );
}
