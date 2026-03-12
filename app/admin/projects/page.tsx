import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Clock,
  FolderKanban,
} from "lucide-react";
import { ProjectListCard } from "./ProjectListCard";
import { deleteProject } from "@/app/admin/actions";
import Navbar from "@/app/ui_components/NavbarAdmin";
import { getSession } from "@/app/lib/session";

function formatLastActivity(date: Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default async function ProjectsPage() {
  const session = await getSession();
  const currentUser = session ? await prisma.users.findUnique({ where: { UserID: session.userId } }) : null;

  const rawProjects = await prisma.projects.findMany({
    include: {
      users: true,
      tasklists: {
        include: {
          tasks: true,
        },
      },
    },
  });

  const projects = rawProjects.map((project) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let lastActivity: Date | null = null;

    project.tasklists.forEach((list) => {
      list.tasks.forEach((task) => {
        totalTasks++;
        if (task.Status === "Completed") completedTasks++;
        if (
          task.DueDate &&
          new Date(task.DueDate) < new Date() &&
          task.Status !== "Completed"
        ) {
          overdueTasks++;
        }
        if (task.CreatedAt) {
          if (!lastActivity || task.CreatedAt > lastActivity) {
            lastActivity = task.CreatedAt;
          }
        }
      });
    });

    const progress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    let health: "on-track" | "at-risk" | "delayed" | "completed" | "idle";
    if (totalTasks === 0) health = "idle";
    else if (progress === 100) health = "completed";
    else if (overdueTasks > 0) health = "at-risk";
    else health = "on-track";

    return {
      ...project,
      totalTasks,
      completedTasks,
      overdueTasks,
      progress,
      health,
      lastActivity,
    };
  });

  const kpis = {
    totalProjects: projects.length,
    onTrack: projects.filter((p) => p.health === "on-track").length,
    atRisk: projects.filter((p) => p.health === "at-risk").length,
    overdueTasks: projects.reduce((sum, p) => sum + p.overdueTasks, 0),
  };

  return (
    <>
      <Navbar userName={currentUser?.UserName} />
      <section className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6">
        {/* Page header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Projects
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              System-wide visibility and health across all projects
            </p>
          </div>
          <Link
            href="/admin/add_project"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shrink-0"
          >
            <Plus className="size-4" aria-hidden />
            New project
          </Link>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                <LayoutGrid className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total projects
                </p>
                <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {kpis.totalProjects}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  On track
                </p>
                <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {kpis.onTrack}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  At risk
                </p>
                <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {kpis.atRisk}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <Clock className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Overdue tasks
                </p>
                <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {kpis.overdueTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectListCard
                key={project.ProjectID}
                project={project}
                deleteAction={deleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 py-16 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 mb-4">
              <FolderKanban className="size-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              No projects yet
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Create your first project to start tracking tasks and team progress.
            </p>
            <Link
              href="/admin/add_project"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Plus className="size-4" aria-hidden />
              New project
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
