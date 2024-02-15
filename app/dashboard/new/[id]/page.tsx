import Link from "next/link";
import prisma from "@/lib/db";
import { XCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/SubmitButtons";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

async function getData({ userId, noteId }: { userId: string; noteId: string }) {
  const data = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  return data;
}

export default async function DynamicNote({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ noteId: params.id, userId: user?.id as string });

  async function postData(formData: FormData) {
    "use server";

    if (!user) {
      redirect("/");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.note.update({
      where: {
        id: data?.id,
        userId: user?.id,
      },
      data: {
        title,
        description,
      },
    });
    revalidatePath("/dashboard");
    return redirect("/dashboard");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
          <CardDescription>You can edit your notes right here</CardDescription>
        </CardHeader>
        <CardContent className="gap-y-5 flex flex-col">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type="text"
              name="title"
              defaultValue={data?.title}
              placeholder="Title for your note"
            />
          </div>
          <div className="gap-y-2 flex flex-col">
            <Label>Description</Label>
            <Textarea
              required
              name="description"
              defaultValue={data?.description}
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
