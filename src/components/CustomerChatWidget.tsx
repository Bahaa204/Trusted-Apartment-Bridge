import { useState, useRef, useEffect } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";

function getOrCreateToken() {
  let token = localStorage.getItem("chat_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("chat_token", token);
  }
  return token;
}

export default function CustomerChatWidget() {
  const [name, setName] = useState<string>("");
  const [conversationId, setConversationId] = useState<
    Conversation["id"] | null
  >(null);
  const [Input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const customerToken = getOrCreateToken();

  const {
    StartConversation,
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

  async function handleStart() {
    if (!name.trim()) return;
    const conversation = await StartConversation(customerToken, name);
    console.log(conversation);

    if (!conversation) return;
    setConversationId(conversation.id);
  }

  async function handleSend() {
    await SendMessage({
      senderType: "customer",
      senderId: customerToken,
      content: Input,
      onAfterSend: () => setInput(""),
    });
  }

  if (!conversationId) {
    return (
      <div className="chat-start">
        <h3>Chat with us</h3>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleStart} className="cursor-pointer">
          Start Chat
        </button>
      </div>
    );
  }

  const loading = ConversationsLoading || MessagesLoading;
  const error = ConversationsError || MessagesError;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div>
        {Messages.map((m) => (
          <div key={m.id}>
            <span>{m.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div>
        <input
          value={Input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="cursor-pointer">
          Send
        </button>
      </div>
    </div>
  );
}
