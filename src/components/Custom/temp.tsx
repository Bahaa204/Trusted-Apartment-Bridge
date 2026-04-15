import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function temp() {
  return (
    // the card action is optional in the header or footer
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>Card Content</CardContent>
      <CardFooter>
        <CardAction>Action</CardAction>
      </CardFooter>
    </Card>
  );
}
