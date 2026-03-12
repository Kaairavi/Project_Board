import { KPIStat } from "@/app/ui_components/KPIStat";
import NavbarTeamMember from "@/app/ui_components/NavbarTeamMember";
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

export default async function TeamMemberDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q ?? "";

  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    return <div className="p-8 text-center text-red-500">Not authorized</div>;
  }

  // Fetch all tasks assigned to the user
  const userTasks = await prisma.tasks.findMany({
    where: {
      AssignedTo: userId,
      Title: {
        contains: q,
      },
    },
    include: {
      tasklists: {
        include: {
          projects: true,
        },
      },
      users: true, // Assignee
    },
    orderBy: {
      DueDate: 'asc',
    }
  });

  const now = new Date();

  const totalTasksCount = userTasks.length;
  const completedTasksCount = userTasks.filter((t) => t.Status === "Completed").length;
  const overdueTasksCount = userTasks.filter(
    (t) => t.DueDate && new Date(t.DueDate) < now && t.Status !== "Completed"
  ).length;

  const activeTasksCount = totalTasksCount - completedTasksCount;

  // Overdue Tasks (Limit 5)
  const overdueTasks = userTasks
    .filter(t => t.DueDate && new Date(t.DueDate) < now && t.Status !== "Completed")
    .sort((a, b) => new Date(a.DueDate!).getTime() - new Date(b.DueDate!).getTime())
    .slice(0, 5);

  // Upcoming Deadlines (Active tasks with due dates in the future)
  const upcomingTasks = userTasks
    .filter(t => t.DueDate && new Date(t.DueDate) >= now && t.Status !== "Completed")
    .sort((a, b) => new Date(a.DueDate!).getTime() - new Date(b.DueDate!).getTime())
    .slice(0, 5);

  // Derive unique project IDs the user is involved in
  const projectIds = Array.from(new Set(userTasks.map(t => t.tasklists?.ProjectID).filter(Boolean))) as number[];

  // Fetch recent tasks from those projects to show "Recent Project Updates"
  const recentProjectActivity = await prisma.tasks.findMany({
    where: {
      tasklists: {
        ProjectID: {
          in: projectIds,
        }
      }
    },
    include: {
      tasklists: {
        include: {
          projects: true,
        }
      },
      users: true, // Assigned to
    },
    orderBy: {
      CreatedAt: 'desc'
    },
    take: 6,
  });


  // Sub-component for rendering a task row
  const TaskRow = ({ task, isOverdue = false, showAssignee = false }: { task: any, isOverdue?: boolean, showAssignee?: boolean }) => (
    <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="min-w-0 flex-1">
        <Link href={`/team_member/projects/${task.tasklists?.ProjectID}`} className="group flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {task.Title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1 -ml-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            {task.tasklists?.projects?.ProjectName || "Unknown Project"}
          </span>
          {showAssignee && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {task.users?.UserName || "Unassigned"}
              </span>
            </>
          )}
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

  const currentUser = await prisma.users.findUnique({ where: { UserID: userId } });

  return (
    <>
      <NavbarTeamMember userName={currentUser?.UserName} />

      <div className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6 pb-20">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your assignments and stay updated on your projects.
          </p>
        </header>

        {/* Global Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIStat label="Total Assigned" value={totalTasksCount} hint="All time tasks" accent="primary" />
            <KPIStat label="Active Tasks" value={activeTasksCount} hint="In progress / Pending" color="rgb(139 92 246)" accent="primary" />
            <KPIStat label="Completed Tasks" value={completedTasksCount} hint="Successfully done" color="rgb(16 185 129)" accent="success" />
            <KPIStat label="Overdue Tasks" value={overdueTasksCount} hint="Requires attention" color="rgb(239 68 68)" accent="danger" />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Active Tasks / Upcoming Deadlines */}
          <section className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="size-4 text-violet-500" />
                My Upcoming Tasks
              </h2>
            </div>
            <div className="flex flex-col -mx-5 px-5">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(t => <TaskRow key={t.TaskID} task={t} />)
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  You have no upcoming tasks making you all caught up!
                </div>
              )}
            </div>

            {overdueTasks.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
                  <AlertCircle className="size-4" />
                  Overdue Tasks
                </h2>
                <div className="flex flex-col -mx-5 px-5">
                  {overdueTasks.map(t => <TaskRow key={t.TaskID} task={t} isOverdue={true} />)}
                </div>
              </div>
            )}
          </section>

          {/* Recent Project Updates */}
          <section className="xl:col-span-1 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="size-4 text-emerald-500" />
                Recent Project Updates
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Across your projects</span>
            </div>
            <div className="flex flex-col -mx-5 px-5">
              {recentProjectActivity.length > 0 ? (
                recentProjectActivity.map(t => <TaskRow key={t.TaskID} task={t} showAssignee={true} />)
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  No recent activity in your projects.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
