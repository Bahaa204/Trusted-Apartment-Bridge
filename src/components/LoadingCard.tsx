import {
  Card,
  CardContent,
} from "./ui/card";
import { Spinner } from "./ui/spinner";

type LoadingCardProps = {
  message: string;
};

export default function LoadingCard({ message }: LoadingCardProps) {
  return (
    <main className="min-h-screen bg-[#e6e0d8] p-4 md:p-8">
      <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
        <CardContent className="flex items-center justify-center gap-3 py-8 text-center text-[#173b67]">
          <Spinner className="size-5 text-[#173b67]" />
          <span>{message}</span>
        </CardContent>
      </Card>
    </main>
  );
}
