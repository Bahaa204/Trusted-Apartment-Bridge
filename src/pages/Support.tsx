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

export default function Support() {
  const { Session, Error, Loading } = useAuth();

  if (Error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Error</CardTitle>
            <CardDescription className="text-slate-600">
              We could not load the support chat. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700">{Error}</CardContent>
          <CardFooter>{new Date().toLocaleString()}</CardFooter>
        </Card>
      </main>
    );
  }

  if (Loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-slate-700">
            <Spinner className="size-5 text-slate-700" />
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
    <>
      <CustomerChatWidget />
    </>
  );
}
