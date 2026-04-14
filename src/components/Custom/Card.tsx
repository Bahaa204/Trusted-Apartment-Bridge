import {
  Card as BaseCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  description,
  children,
  className,
}: CardProps) {
  return (
    <BaseCard className={className}>
      <CardHeader className="flex flex-col flex-wrap justify-evenly items-center">
        <CardTitle className="text-5xl">{title}</CardTitle>
        <CardDescription className="text-xl text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap flex-col justify-evenly gap-3">
        {children}
      </CardContent>
    </BaseCard>
  );
}
