import Link from "next/link";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/SubmitButtons";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BSP-SaaS | New Note",
};

export default async function NewNote() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  async function postData(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.note.create({
      data: {
        title,
        description,
        userId: user?.id,
      },
    });

    return redirect("/dashboard");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
          <CardDescription>
            You can create a new note right here
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-y-5 flex flex-col">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type="text"
              name="title"
              placeholder="Title for your note"
            />
          </div>
          <div className="gap-y-2 flex flex-col">
            <Label>Description</Label>
            <Textarea
              required
              name="description"
              placeholder="Describe your note as you want"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant={"outline"} asChild>
            <Link href={"/dashboard"} className="hover:text-red-500 flex gap-2">
              <XCircleIcon className="h-5 w-5 text-primary" />
              Cancel
            </Link>
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
