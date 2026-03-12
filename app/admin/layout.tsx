import { getSession } from "../lib/session";
import { prisma } from "../lib/prisma";
import AppShell from "../ui_components/AppShell";
import Sidebar from "../ui_components/SidebarAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const currentUser = session?.userId
    ? await prisma.users.findUnique({ where: { UserID: session.userId } })
    : null;

  return <AppShell Sidebar={Sidebar} userName={currentUser?.UserName}>{children}</AppShell>;
}


