import { useState, useRef, useEffect } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";

export default function StaffChatDashboard() {
  const [selectedId, setSelectedId] = useState<Conversation["id"] | null>(null);
  const [Input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    Conversations,
    Loading: ConversationsLoading,
    Error: ConversationsError,
    CloseConversation,
    BumpConversation,
  } = useConversations();

  const selectedConversationId =
    selectedId &&
    Conversations.some((conversation) => conversation.id === selectedId)
      ? selectedId
      : Conversations[0]?.id || null;

  const selected =
    Conversations.find(
      (conversation) => conversation.id === selectedConversationId,
    ) || null;

  const {
    Messages,
    Loading: MessagesLoading,
    Error: MessagesError,
    SendMessage,
  } = useMessages(selected?.id);

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  async function handleReply() {
    if (!Session || !selected) return;

    const roleFromEmail = Session.user.email?.endsWith("@tab-admin.com")
      ? "admin"
      : "employee";

    await SendMessage({
      senderType: roleFromEmail,
      senderId: Session.user.email || Session.user.id,
      content: Input,
      onAfterSend: () => {
        setInput("");
        BumpConversation(selected.id);
      },
    });
  }

  async function handleClose(id: Conversation["id"]) {
    const closed = await CloseConversation(id);
    if (!closed) return;

    if (selected?.id === id) setSelectedId(null);
  }

  function formatSender(senderType: string, senderId: string) {
    if (senderType === "customer") {
      if (selected?.customer_name?.trim()) {
        return `Customer (${selected.customer_name})`;
      }

      const hasEmail = senderId.includes("@");
      return hasEmail ? `Customer (${senderId})` : "Customer";
    }

    if (senderType === "admin") {
      return "Admin";
    }

    return "Employee";
  }

  const loading = ConversationsLoading || MessagesLoading || AuthLoading;
  const error = ConversationsError || MessagesError || AuthError;

  if (error) {
    return <div className="chat-error">{error}</div>;
  }

  return (
    <section className="staff-chat-shell">
      <aside className="staff-chat-sidebar">
        <header>
          <h3>Open Chats</h3>
          <p>{Conversations.length} active</p>
        </header>

        {loading ? (
          <div className="staff-chat-loading">
            {AuthLoading ? "Checking Authentication" : "Loading chats"}...
          </div>
        ) : Conversations.length === 0 ? (
          <div className="staff-chat-empty-list">
            No open conversations yet.
          </div>
        ) : (
          Conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`staff-chat-list-item ${conversation.id === selectedConversationId ? "active" : ""}`}
            >
              <strong>{conversation.customer_name || "Customer"}</strong>
              <time>
                {new Date(conversation.updated_at).toLocaleTimeString()}
              </time>
            </div>
          ))
        )}
      </aside>

      <main className="staff-chat-main">
        {selected ? (
          <>
            <header className="staff-chat-header">
              <div>
                <h4>{selected.customer_name || "Customer"}</h4>
                <p>Open support conversation</p>
              </div>
              <button
                onClick={() => handleClose(selected.id)}
                className="chat-secondary-btn"
                type="button"
              >
                Close Chat
              </button>
            </header>

            <div className="chat-messages">
              {Messages.map((m) => (
                <article
                  key={m.id}
                  className={`chat-message-row ${m.sender_type === "customer" ? "theirs" : "mine"}`}
                >
                  <div
                    className={`chat-bubble ${m.sender_type === "customer" ? "theirs" : "mine"}`}
                  >
                    <div className="chat-sender-line">
                      {formatSender(m.sender_type, m.sender_id)}
                    </div>
                    <p>{m.content}</p>
                    <time>{new Date(m.created_at).toLocaleTimeString()}</time>
                  </div>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-wrap">
              <input
                value={Input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Reply..."
              />
              <button
                onClick={handleReply}
                className="chat-primary-btn"
                type="button"
                disabled={!Input.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="staff-chat-main-empty">
            Select a conversation from the left panel to reply.
          </div>
        )}
      </main>
    </section>
  );
}
