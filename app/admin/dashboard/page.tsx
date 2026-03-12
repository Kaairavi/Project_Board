import { KPIStat } from "@/app/ui_components/KPIStat";
import { ProjectCard } from "@/app/ui_components/ProjectCardAdmin";
import Navbar from "@/app/ui_components/NavbarAdmin";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q ?? "";

  const projects = await prisma.projects.findMany({
    where: {
      ProjectName: {
        contains: q,
      },
    },
    include: {
      users: true,
      tasklists: {
        include: {
          tasks: true,
        },
      },
    },
  });
  const now = new Date();

  let total = projects.length;
  let completed = 0;
  let delayed = 0;
  let active = 0;

  const projectsWithStats = projects.map((project) => {
    const tasks = project.tasklists.flatMap((l) => l.tasks);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.Status === "Completed"
    ).length;

    const completion =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    const hasOverdue = tasks.some(
      (t) =>
        t.DueDate &&
        new Date(t.DueDate) < now &&
        t.Status !== "Completed"
    );

    let status: "Completed" | "Delayed" | "Active";

    if (totalTasks > 0 && completedTasks === totalTasks) {
      status = "Completed";
      completed++;
    } else if (hasOverdue) {
      status = "Delayed";
      delayed++;
    } else {
      status = "Active";
      active++;
    }

    return {
      ...project,
      completion,
      status,
    };
  });

  const session = await getSession();
  const currentUser = session ? await prisma.users.findUnique({ where: { UserID: session.userId } }) : null;

  return (
    <>
      <Navbar userName={currentUser?.UserName} />

      <div className="min-h-[calc(100vh-4rem)] rounded-2xl bg-[#f8f9fb] p-5 md:p-6">
        {/* Welcoming header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Good morning
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here’s an overview of your projects. Let’s keep things on track.
          </p>
        </header>

        {/* KPI strip — soft elevation, clear hierarchy */}
        <section className="mb-8" aria-label="Summary statistics">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPIStat
              label="Total projects"
              value={total}
              hint="All projects"
              accent="primary"
            />
            <KPIStat
              label="Active"
              value={active}
              hint="In progress"
              accent="active"
            />
            <KPIStat
              label="Completed"
              value={completed}
              hint="All tasks done"
              color="rgb(var(--success))"
              accent="success"
            />
            <KPIStat
              label="Delayed"
              value={delayed}
              hint="Past due"
              color="rgb(var(--danger))"
              accent="danger"
            />
          </div>
        </section>

        {/* Projects list — card rows with soft shadow */}
        <section aria-label="Project statistics">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today’s projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projectsWithStats.map((p) => (
              <ProjectCard key={p.ProjectID} project={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

