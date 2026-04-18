import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate } from "react-router-dom";

export default function NotFound() {

  useDocumentTitle("Not Found")

  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e6e0d8] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.36),rgba(255,255,255,0.12))]" />
      <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-slate-950/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-16 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 md:px-8">
        <Card className="w-full max-w-2xl overflow-hidden border border-white/70 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.2)] backdrop-blur p-0!">
          <CardHeader className="gap-3 border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white md:px-8">
            <Breadcrumbs style="light" />
            <p className="mt-4 inline-flex w-fit rounded-full border border-orange-300/40 bg-orange-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-100">
              Page Missing
            </p>
            <CardTitle className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              404: Not Found
            </CardTitle>
            <CardDescription className="mt-3 text-sm text-slate-300 md:text-base">
              The page you are looking for does not exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-xl border border-orange-300 bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-800"
                onClick={() => {
                  navigate("/");
                }}
              >
                Return Home
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-300 bg-white text-slate-900 transition-colors hover:bg-slate-100"
                onClick={() => {
                  navigate(-1);
                }}
              >
                Go Back
              </Button>
            </div>
          </CardContent>

          <CardFooter className="justify-end border-t border-slate-200 bg-white/80 px-6 py-3 text-xs text-slate-600 md:px-8">
            {new Date().toLocaleString()}
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
