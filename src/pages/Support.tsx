import { useAuth } from "@/hooks/useAuth";
import CustomerChatWidget from "../components/CustomerChatWidget";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Support() {
  const { Session, Error, Loading } = useAuth();

  if (Error) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0f2f4f]">Error</CardTitle>
            <CardDescription className="text-[#24507f]">
              We could not load the support chat. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[#173b67]">{Error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  if (Loading) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-[#173b67]">
            <Spinner className="size-5 text-[#173b67]" />
            <span>Checking Authentication...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!Session) {
    alert("You must be logged in to access the support chat.");
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Breadcrumbs />
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
