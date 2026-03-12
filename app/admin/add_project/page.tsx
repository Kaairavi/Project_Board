import { prisma } from "@/app/lib/prisma";
import { AddProjectForm } from "./AddProjectForm";
import { getSession } from "@/app/lib/session";
import NavbarAdmin from "@/app/ui_components/NavbarAdmin";

export default async function AddProjectPage() {
  const managers = await prisma.users.findMany({
    where: {
      user_roles: {
        some: {
          roles: {
            RoleName: "Manager",
          },
        },
      },
    },
    select: {
      UserID: true,
      UserName: true,
      Email: true,
    },
    orderBy: { UserName: "asc" },
  });

  const session = await getSession();
  const currentUser = session?.userId
    ? await prisma.users.findUnique({ where: { UserID: session.userId } })
    : null;

  return (
    <>
      <NavbarAdmin userName={currentUser?.UserName} />
      <section className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6">
        <AddProjectForm managers={managers} />
      </section>
    </>
  );
}
