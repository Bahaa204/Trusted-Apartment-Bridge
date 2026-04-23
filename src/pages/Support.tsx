import { useAuth } from "@/hooks/useAuth";
import CustomerChatWidget from "../components/CustomerChatWidget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";

export default function Support() {
  useDocumentTitle("Support");

  const { Session, Error, Loading } = useAuth();
  const navigate = useNavigate();

  if (Error) {
    return (
      <ErrorCard
        message="We could not load the support chat. Please try again later."
        error={Error}
      />
    );
  }

  if (Loading) {
    return <LoadingCard message="Checking Authentication..." />;
  }

  if (!Session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <p className="text-lg text-[#10243e]">
          You must be logged in to access this page.
        </p>
        <Button
          variant="link"
          className="cursor-pointer text-lg"
          onClick={() => navigate("/login")}
        >
          Navigate to Login
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <Breadcrumbs />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0f2f4f]">
              Support Chat
            </CardTitle>
            <CardDescription className="text-[#24507f]">
              Ask questions and get help from the TAB support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <CustomerChatWidget />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
