import { useEffect, useMemo, useRef, useState } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { supabaseClient } from "@/lib/supabaseClient";

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

  if (!conversationId) {
    return (
      <section className="customer-chat-shell">
        {CloseNotice ? (
          <div className="chat-notice" role="status" aria-live="polite">
            {CloseNotice}
          </div>
        ) : null}

        <header className="chat-head">
          <div>
            <h3>Support Chat</h3>
            <p>{customerLabel}</p>
          </div>
        </header>

        <div className="chat-start-state">
          <h4>No support chat yet</h4>
          <p>
            Start a conversation with our support team. We typically reply
            within a few minutes.
          </p>
          <button
            onClick={handleStart}
            className="chat-primary-btn"
            type="button"
          >
            Start Chat
          </button>
        </div>
      </section>
    );
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
    <section className="customer-chat-shell">
      {CloseNotice ? (
        <div className="chat-notice" role="status" aria-live="polite">
          {CloseNotice}
        </div>
      ) : null}

      <header className="chat-head">
        <div>
          <h3>Support Chat</h3>
          <p>{customerLabel}</p>
        </div>
      </header>

      <div className="chat-messages">
        {Messages.length === 0 ? (
          <div className="chat-empty-hint">
            Send your first message and a team member will join soon.
          </div>
        ) : (
          Messages.map((m) => {
            const isCustomer = m.sender_type === "customer";

            return (
              <article
                key={m.id}
                className={`chat-message-row ${isCustomer ? "mine" : "theirs"}`}
              >
                <div
                  className={`chat-bubble ${isCustomer ? "mine" : "theirs"}`}
                >
                  <div className="chat-sender-line">
                    {formatMessageSender(m.sender_type, m.sender_id)}
                  </div>
                  <p>{m.content}</p>
                  <time>{new Date(m.created_at).toLocaleTimeString()}</time>
                </div>
              </article>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

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
    </section>
  );
}
