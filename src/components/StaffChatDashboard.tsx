import { useState, useRef, useEffect } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";

export default function StaffChatDashboard() {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [Input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    Conversations,
    Loading: ConversationsLoading,
    Error: ConversationsError,
    CloseConversation,
    BumpConversation,
  } = useConversations();

  const {
    Messages,
    Loading: MessagesLoading,
    Error: MessagesError,
    SendMessage,
  } = useMessages(selected?.id);

  const { Loading: AuthLoading, Error: AuthError, GetUser } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);

  async function handleReply() {
    const user = await GetUser();
    if (!user || !selected) return;

    await SendMessage({
      senderType: user.user_metadata?.role || "employee",
      senderId: user.id,
      content: Input,
      onAfterSend: () => {
        setInput("");
        BumpConversation(selected.id);
      },
    });
  }

  async function handleClose(id: Conversation["id"]) {
    await CloseConversation(id);
    if (selected?.id === id) setSelected(null);
  }

  const loading = ConversationsLoading || MessagesLoading || AuthLoading;
  const error = ConversationsError || MessagesError || AuthError;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="staff-dashboard">
      <aside className="conversation-list">
        <h3>Open Chats</h3>
        {loading ? (
          <p>{AuthLoading ? "Checking Authentication" : "Loading"}...</p>
        ) : (
          Conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelected(conversation)}
            >
              <strong>{conversation.customer_name || "Anonymous"}</strong>
              <span>
                {new Date(conversation.updated_at).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </aside>

      <main>
        {selected ? (
          <>
            <div>
              <span>{selected.customer_name}</span>
              <button
                onClick={() => handleClose(selected.id)}
                className="cursor-pointer"
              >
                Close Chat
              </button>
            </div>
            <div>
              {Messages.map((m) => (
                <div key={m.id}>
                  <label>{m.sender_type}</label>
                  <p>{m.content}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div>
              <input
                value={Input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Reply..."
              />
              <button onClick={handleReply} className="cursor-pointer">
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a conversation to start replying</p>
        )}
      </main>
    </div>
  );
}
