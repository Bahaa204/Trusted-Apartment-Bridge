import type { HTMLAttributes } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ErrorCardProps = {
  error: string;
  message: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function ErrorCard({
  message,
  error,
  className,
}: ErrorCardProps) {
  return (
    <main className={`min-h-screen bg-[#e6e0d8] p-4 md:p-8 ${className || ""}`}>
      <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-[#0f2f4f]">Error</CardTitle>
          <CardDescription className="text-[#24507f]">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[#173b67]">{error}</CardContent>
        <CardFooter>{new Date().toLocaleString()}</CardFooter>
      </Card>
    </main>
  );
}
