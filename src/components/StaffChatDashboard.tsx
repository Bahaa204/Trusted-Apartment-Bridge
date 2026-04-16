import { useState, useRef, useEffect, type SubmitEvent } from "react";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { titleCase } from "title-case";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input as InputElement } from "@/components/ui/input";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "./ui/field";

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

  async function handleReply(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Session || !selected || !Input) return;

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
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Error</CardTitle>
            <CardDescription className="text-slate-600">
              We could not load the support chat. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700">{error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <Card className="staff-chat-shell p-0! gap-0!">
      {/* Side Bar Card */}
      <Card className="staff-chat-sidebar rounded-none!">
        <CardHeader className="p-3">
          <CardTitle>Open Chats</CardTitle>
          <CardDescription>{Conversations.length} active</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="staff-chat-loading">
              {AuthLoading ? "Checking Authentication" : "Loading chats"}...
            </div>
          ) : Conversations.length === 0 ? (
            <div className="staff-chat-empty-list">
              No open conversations yet.
            </div>
          ) : (
            Conversations.map((conversation, index) => (
              <Card
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`staff-chat-list-item ${conversation.id === selectedConversationId ? "active" : ""} rounded-none`}
              >
                <CardHeader className="p-0">
                  <CardTitle>
                    {titleCase(conversation.customer_name || "Customer")}
                  </CardTitle>
                  <CardDescription>Customer {index + 1}</CardDescription>
                </CardHeader>
                <CardFooter className="bg-transparent p-2!">
                  {new Date(conversation.updated_at).toLocaleTimeString()}
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Conversation Card */}
      <Card className="staff-chat-main rounded-none! p-0! bg-transparent">
        {selected ? (
          <Card className="min-h-screen rounded-none! p-0! bg-transparent">
            <CardHeader className="staff-chat-header">
              <CardTitle>
                {titleCase(selected.customer_name || "Customer")}
              </CardTitle>
              <CardDescription>Open support conversation</CardDescription>
              <CardAction>
                <Button
                  onClick={() => handleClose(selected.id)}
                  className="chat-secondary-btn"
                  type="button"
                >
                  Close Chat
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="min-h-screen bg-transparent">
              {/* Messages Container */}
              <Card className="chat-messages bg-none! rounded-none! border-0! min-h-screen">
                {Messages.map((m) => (
                  <div
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
                  </div>
                ))}
                <div ref={bottomRef} />
              </Card>
            </CardContent>
            <form
              onSubmit={handleReply}
              className="chat-input-wrap flex flex-col justify-center items-center"
            >
              <FieldGroup>
                <Field>
                  <FieldTitle>
                    <FieldLabel htmlFor="chat-input">
                      Type Your Reply
                    </FieldLabel>
                  </FieldTitle>
                  <InputElement
                    value={Input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply..."
                    className="p-3!"
                    required
                  />
                </Field>
              </FieldGroup>
              <FieldSeparator className="min-w-screen" />
              <FieldGroup>
                <Field>
                  <Button
                    variant="ghost"
                    className="chat-primary-btn"
                    type="submit"
                    disabled={!Input.trim()}
                  >
                    Send
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </Card>
        ) : (
          <CardTitle className="staff-chat-main-empty">
            Select a conversation from the left panel to reply.
          </CardTitle>
        )}
      </Card>
    </Card>
  );
}
