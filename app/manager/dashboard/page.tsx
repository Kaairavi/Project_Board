import { KPIStat } from "@/app/ui_components/KPIStat";
import ProjectCard from "@/app/ui_components/projects/ProjectCard";
import NavbarManager from "@/app/ui_components/NavbarManager";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import { AlertCircle, Clock, CalendarIcon, ListTodo, Activity, CheckCircle2 } from "lucide-react";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(d).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function PriorityBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const map: Record<string, string> = {
    High: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
    Medium:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  };
  const className = map[value] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${className}`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    Completed:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    "In Progress":
      "bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20",
    Pending:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
  };
  const className = map[value ?? "Pending"] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${className}`}
    >
      {value ?? "Pending"}
    </span>
  );
}

export default async function ManagerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q ?? "";

  const session = await getSession();
  const managerId = session?.userId;

  if (!managerId) {
    return <div className="p-8 text-center text-red-500">Not authorized</div>;
  }

  const projects = await prisma.projects.findMany({
    where: {
      CreatedBy: managerId,
      ProjectName: {
        contains: q,
      },
    },
    include: {
      users: true,
      tasklists: {
        include: {
          tasks: {
            include: {
              users: true,
            }
          },
        },
      },
    },
  });

  const now = new Date();

  let totalProjects = projects.length;
  let completedProjects = 0;
  let delayedProjects = 0;
  let activeProjects = 0;

  const allTasks: any[] = [];

  const projectsWithStats = projects.map((project) => {
    const tasks = project.tasklists.flatMap((l) => l.tasks);

    // Add tasks to flat list with project context
    tasks.forEach(t => allTasks.push({ ...t, projectName: project.ProjectName, projectId: project.ProjectID }));

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

    const activeMembers = new Set(
      tasks.filter(t => t.AssignedTo).map(t => t.AssignedTo)
    ).size;

    let status: "Completed" | "Delayed" | "Active";

    if (totalTasks > 0 && completedTasks === totalTasks) {
      status = "Completed";
      completedProjects++;
    } else if (hasOverdue) {
      status = "Delayed";
      delayedProjects++;
    } else {
      status = "Active";
      activeProjects++;
    }

    return {
      ...project,
      totalTasks,
      completedTasks,
      completion,
      status,
      activeMembersCount: activeMembers
    };
  });

  // Calculate global task stats
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter(t => t.Status === "Completed").length;
  const overdueTasksCount = allTasks.filter(t => t.DueDate && new Date(t.DueDate) < now && t.Status !== "Completed").length;

  // Overdue Tasks (Limit 5)
  const overdueTasks = allTasks
    .filter(t => t.DueDate && new Date(t.DueDate) < now && t.Status !== "Completed")
    .sort((a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())
    .slice(0, 5);

  // Upcoming Deadlines (Limit 5)
  const upcomingTasks = allTasks
    .filter(t => t.DueDate && new Date(t.DueDate) >= now && t.Status !== "Completed")
    .sort((a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())
    .slice(0, 5);


  // Recent Activity (Completed recently or created recently)
  const recentActivity = allTasks
    .filter(t => t.CreatedAt)
    .sort((a, b) => {
      // Mocking recent completion by treating recently created as recent activity for now
      return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
    })
    .slice(0, 5);

  // Sub-component for rendering a task row
  const TaskRow = ({ task, isOverdue = false }: { task: any, isOverdue?: boolean }) => (
    <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="min-w-0 flex-1">
        <Link href={`/manager/projects/${task.projectId}`} className="group flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {task.Title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1 -ml-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            {task.projectName}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {task.users?.UserName || "Unassigned"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <div className="hidden sm:flex flex-col items-end gap-1">
          <PriorityBadge value={task.Priority} />
          <StatusBadge value={task.Status} />
        </div>
        {task.DueDate && (
          <div className={`text-xs whitespace-nowrap px-2 py-1 flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
            <CalendarIcon className="size-3" />
            {formatDate(task.DueDate)}
          </div>
        )}
      </div>
    </div>
  );

  const currentUser = await prisma.users.findUnique({ where: { UserID: managerId } });

  return (
    <>
      <NavbarManager userName={currentUser?.UserName} />

      <div className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6 pb-20">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Manager Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor and guide your assigned projects and team tasks to success.
          </p>
        </header>

        {/* Global Summary Cards */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Performance Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIStat label="Total Projects" value={totalProjects} hint="Assigned" accent="primary" />
            <KPIStat label="Total Tasks" value={totalTasksCount} hint="Across all projects" color="rgb(59 130 246)" accent="primary" />
            <KPIStat label="Completed Tasks" value={completedTasksCount} hint="Total done" color="rgb(16 185 129)" accent="success" />
            <KPIStat label="Overdue Tasks" value={overdueTasksCount} hint="Needs attention" color="rgb(239 68 68)" accent="danger" />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Project Progress */}
          <section className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="size-4 text-slate-500" />
                Active Projects Progress
              </h2>
              <Link href="/manager/projects" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {projectsWithStats.filter(p => p.status !== "Completed").slice(0, 4).map(p => (
                <div key={p.ProjectID} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <Link href={`/manager/projects/${p.ProjectID}`} className="font-medium text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate pr-4">
                      {p.ProjectName}
                    </Link>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{p.completion}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400"
                      style={{ width: `${p.completion}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-slate-400 dark:text-slate-500">
                    <span>{p.completedTasks} of {p.totalTasks} tasks</span>
                    {p.status === 'Delayed' && <span className="font-medium">Has delayed tasks</span>}
                  </div>
                </div>
              ))}
              {projectsWithStats.filter(p => p.status !== "Completed").length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                  No active projects at the moment.
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section className="xl:col-span-1 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="size-4 text-amber-500" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="flex flex-col -mx-5 px-5">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(t => <TaskRow key={t.TaskID} task={t} />)
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  No upcoming deadlines in the near future.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Overdue Tasks */}
          <section className="rounded-xl border border-red-200/50 dark:border-red-900/30 bg-white dark:bg-slate-800/50 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="size-4" />
                Attention Needed (Overdue)
              </h2>
            </div>
            <div className="flex flex-col -mx-5 px-5">
              {overdueTasks.length > 0 ? (
                overdueTasks.map(t => <TaskRow key={t.TaskID} task={t} isOverdue={true} />)
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  No overdue tasks! Great job.
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Recently Added Tasks
              </h2>
            </div>
            <div className="flex flex-col -mx-5 px-5">
              {recentActivity.length > 0 ? (
                recentActivity.map(t => <TaskRow key={t.TaskID} task={t} />)
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  No recent activity.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
