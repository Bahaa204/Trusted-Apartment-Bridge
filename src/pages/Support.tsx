import { useAuth } from "@/hooks/useAuth";
import CustomerChatWidget from "../components/CustomerChatWidget";
import { Navigate } from "react-router-dom";

export default function Support() {
  const { Session, Error, Loading } = useAuth();

  if (Error) {
    return <div>{Error}</div>;
  }

  if (Loading) {
    return <div>Checking Authentication...</div>;
  }

  if (!Session) {
    alert("You must be logged in to access the support chat.");
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <CustomerChatWidget />
    </>
  );
}
