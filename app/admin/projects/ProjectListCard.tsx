"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DeleteButton } from "@/app/ui_components/DeleteButton";
import type { DeleteProjectResult } from "@/app/admin/actions";

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

const healthConfig = {
  "on-track": {
    label: "On track",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/15 border border-emerald-500/20",
  },
  "at-risk": {
    label: "At risk",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/15 border border-amber-500/20",
  },
  delayed: {
    label: "Delayed",
    className:
      "bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/15 border border-red-500/20",
  },
  completed: {
    label: "Completed",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/15 border border-blue-500/20",
  },
  idle: {
    label: "Idle",
    className:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 dark:bg-slate-500/15 border border-slate-500/20",
  },
} as const;

type Project = {
  ProjectID: number;
  ProjectName: string;
  Description: string | null;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progress: number;
  health: keyof typeof healthConfig;
  lastActivity: Date | null;
};

type DeleteProjectAction = (projectId: number) => Promise<DeleteProjectResult>;

type ProjectListCardProps = {
  project: Project;
  deleteAction: DeleteProjectAction;
};

export function ProjectListCard({ project, deleteAction }: ProjectListCardProps) {
  const router = useRouter();
  const health = healthConfig[project.health];

  const handleDelete = async () => {


    const result = await deleteAction(project.ProjectID);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <article
      className="group relative rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 overflow-hidden"
    >
      <Link
        href={`/admin/projects/${project.ProjectID}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${project.ProjectName}`}
      />
      {/* Delete button positioned above the link */}

      <div className="relative z-20 p-6 flex flex-col gap-5 pointer-events-none">
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {project.ProjectName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {project.Description || "No description"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 z-30 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-md border ${health.className}`}
            >
              {health.label}
            </span>

            <DeleteButton
              variant="icon"
              ariaLabel={`Delete ${project.ProjectName}`}
              confirmTitle={`Delete "${project.ProjectName}"?`}
              confirmDescription="All task lists and tasks in this project will be permanently removed. This cannot be undone."
              onConfirm={() => handleDelete()}
            />

          </div>

        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {project.progress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-700 dark:bg-slate-400 transition-[width] duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 py-2.5 px-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tasks
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {project.totalTasks}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 py-2.5 px-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Done
            </p>
            <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {project.completedTasks}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 py-2.5 px-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overdue
            </p>
            <p
              className={`text-sm font-semibold tabular-nums mt-0.5 ${project.overdueTasks > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400"
                }`}
            >
              {project.overdueTasks}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700/80">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last activity{" "}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {formatLastActivity(project.lastActivity)}
            </span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
            View project
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
