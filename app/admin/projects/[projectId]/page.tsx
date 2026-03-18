import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/app/lib/session";
import NavbarAdmin from "@/app/ui_components/NavbarAdmin";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  ListTodo,
  User,
  Calendar,
  LayoutList,
} from "lucide-react";
import { MarkCompletedButton } from "./MarkCompletedButton";
import { EditTaskModal } from "./EditTaskModal";
import { AddTaskModal } from "./AddTaskModal";
import { DeleteTaskButton } from "./DeleteTaskButton";

type Priority = "High" | "Medium" | "Low";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(d).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export default async function ProjectPageAdmin({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const id = Number(projectId);

  const project = await prisma.projects.findFirst({
    where: { ProjectID: id },
    include: {
      users: true,
      tasklists: {
        include: {
          tasks: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const teamMembers = await prisma.users.findMany({
    where: {
      user_roles: {
        some: {
          roles: {
            RoleName: "Team_Member",
          },
        },
      },
    },
    select: {
      UserID: true,
      UserName: true,
    },
  });

  const tasks = project.tasklists.flatMap((list) => list.tasks);
  const stats = tasks.reduce(
    (acc, task) => {
      acc.totalTasks++;
      if (task.Status === "Completed") acc.completed++;
      if (task.Status === "Pending") acc.pending++;
      if (task.Status === "In Progress") acc.inProgress++;
      if (
        task.DueDate &&
        new Date(task.DueDate) < new Date() &&
        task.Status !== "Completed"
      ) {
        acc.overdue++;
      }
      if (task.Priority) {
        acc.priorityCount[task.Priority as Priority]++;
      }
      return acc;
    },
    {
      totalTasks: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      priorityCount: { High: 0, Medium: 0, Low: 0 } as Record<Priority, number>,
    }
  );

  const progress =
    stats.totalTasks === 0
      ? 0
      : Math.round((stats.completed / stats.totalTasks) * 100);

  const health: "Idle" | "Completed" | "At Risk" | "On Track" =
    stats.totalTasks === 0
      ? "Idle"
      : progress === 100
        ? "Completed"
        : stats.overdue > 0
          ? "At Risk"
          : "On Track";

  const healthConfig = {
    "On Track":
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    "At Risk":
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    Completed:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    Idle: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
  };

  const kpiColorMap = {
    slate: "text-slate-900 dark:text-slate-100",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  } as const;

  const session = await getSession();
  const currentUser = session?.userId
    ? await prisma.users.findUnique({ where: { UserID: session.userId } })
    : null;

  return (
    <>
      <NavbarAdmin userName={currentUser?.UserName} />
      <section className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6">
        {/* Back link */}
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to projects
        </Link>

        {/* Hero card */}
        <header className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {project.ProjectName}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                {project.Description || "No description provided"}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <User className="size-4 text-slate-400" aria-hidden />
                  {project.users?.UserName ?? "Not assigned"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Calendar className="size-4 text-slate-400" aria-hidden />
                  Created {project.CreatedAt ? formatDate(project.CreatedAt) : "—"}
                </span>
              </div>
            </div>
            <span
              className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${healthConfig[health]}`}
            >
              {health}
            </span>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-700 dark:bg-slate-400 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <KpiCard
            label="Total tasks"
            value={stats.totalTasks}
            icon={ListTodo}
            colorClass={kpiColorMap.slate}
          />
          <KpiCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            colorClass={kpiColorMap.emerald}
          />
          <KpiCard
            label="Pending"
            value={stats.pending}
            icon={Circle}
            colorClass={kpiColorMap.slate}
          />
          <KpiCard
            label="Overdue"
            value={stats.overdue}
            icon={Clock}
            colorClass={kpiColorMap.red}
          />
          <KpiCard
            label="High priority"
            value={stats.priorityCount.High}
            icon={Flag}
            colorClass={kpiColorMap.amber}
          />
        </div>

        {/* Status & Priority summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SummaryCard title="Task status">
            <StatusRow
              label="Completed"
              value={stats.completed}
              valueClass="text-emerald-600 dark:text-emerald-400"
            />
            <StatusRow
              label="In progress"
              value={stats.inProgress}
              valueClass="text-blue-600 dark:text-blue-400"
            />
            <StatusRow
              label="Pending"
              value={stats.pending}
              valueClass="text-slate-600 dark:text-slate-400"
            />
          </SummaryCard>
          <SummaryCard title="Priority distribution">
            <StatusRow
              label="High"
              value={stats.priorityCount.High}
              valueClass="text-red-600 dark:text-red-400"
            />
            <StatusRow
              label="Medium"
              value={stats.priorityCount.Medium}
              valueClass="text-amber-600 dark:text-amber-400"
            />
            <StatusRow
              label="Low"
              value={stats.priorityCount.Low}
              valueClass="text-emerald-600 dark:text-emerald-400"
            />
          </SummaryCard>
        </div>

        {/* Tasks table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              <LayoutList className="size-5 text-slate-500 dark:text-slate-400" aria-hidden />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tasks
              </h2>
            </div>
            <AddTaskModal projectId={id} teamMembers={teamMembers} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Due date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No tasks in this project yet.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const isOverdue =
                      task.DueDate &&
                      new Date(task.DueDate) < new Date() &&
                      task.Status !== "Completed";
                    return (
                      <tr
                        key={task.TaskID}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {task.Title}
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge value={task.Priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge value={task.Status ?? "Pending"} />
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {task.users?.UserName ?? "—"}
                        </td>
                        <td
                          className={`px-6 py-4 tabular-nums ${isOverdue
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-slate-600 dark:text-slate-400"
                            }`}
                        >
                          {task.DueDate ? formatDate(task.DueDate) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {task.Status !== "Completed" && (
                              <MarkCompletedButton taskId={task.TaskID} projectId={id} />
                            )}
                            <EditTaskModal projectId={id} teamMembers={teamMembers} task={task} />
                            <DeleteTaskButton task={task} projectId={id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className={`text-2xl font-semibold tabular-nums mt-0.5 ${colorClass}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
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
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Completed:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    "In Progress":
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    Pending:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
  };
  const className = map[value] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}
    >
      {value}
    </span>
  );
}
