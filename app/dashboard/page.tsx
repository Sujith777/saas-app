import Link from "next/link";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { DeleteNoteButton } from "@/components/SubmitButtons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BSP-SaaS | Dashboard",
};

async function getData(userId: string) {
  const data = await prisma.note.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);

  async function deleteNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    revalidatePath("/dashboard");
  }

  return (
    <div className="grid items-start gap-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Your Notes</h1>
          <p className="text-lg text-muted-foreground">
            Here you can view and create notes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">Create a new Note</Link>
        </Button>
      </div>

      {data.length < 1 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            You dont&apos;t have any notes created
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            You currently dont&apos;t have any notes. Please create some so that
            you can see them right here.
          </p>
          <Button asChild>
            <Link href="/dashboard/new">Create a new Note</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.map((item) => (
            <Card
              key={item?.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex flex-col">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary">
                    {item.title}
                  </h2>
                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(new Date(item.createdAt))}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-md text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </div>
              <div className="flex gap-x-4">
                <Link href={`/dashboard/new/${item.id}`}>
                  <Button variant={"outline"} size={"icon"}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <form action={deleteNote}>
                  <input type="hidden" name="noteId" value={item?.id} />

                  <DeleteNoteButton />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
