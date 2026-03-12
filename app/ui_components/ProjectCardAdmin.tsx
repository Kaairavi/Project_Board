import { CircularProgress } from "./CircularProgress";
import { CheckCircle, AlertCircle, CircleDot, FolderKanban } from "lucide-react";

export type ProjectCardProps = {
  project: {
    ProjectID: number;
    ProjectName: string;
    status?: string;
    completion?: number;
    tasklists?: any[];
    users?: { UserName: string | null } | null;
  };
  /** Optional slot for actions (e.g. delete button). Rendered after the progress ring. */
  actions?: React.ReactNode;
};

const statusConfig = {
  Delayed: {
    label: "Delayed",
    Icon: AlertCircle,
    pillClass: "bg-red-50 text-red-700",
    iconBg: "bg-red-100 text-red-600",
  },
  Completed: {
    label: "Completed",
    Icon: CheckCircle,
    pillClass: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  Active: {
    label: "Active",
    Icon: CircleDot,
    pillClass: "bg-indigo-50 text-indigo-700",
    iconBg: "bg-indigo-100 text-indigo-600",
  },
} as const;

export function ProjectCard({ project, actions }: ProjectCardProps) {
  const status: keyof typeof statusConfig =
    project.status && project.status in statusConfig
      ? (project.status as keyof typeof statusConfig)
      : "Active";
  const { label: statusLabel, Icon: StatusIcon, pillClass, iconBg } = statusConfig[status];

  const tasks = project.tasklists?.flatMap((l: { tasks: any[] }) => l.tasks) ?? [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: { Status: string }) => t.Status === "Completed").length;
  const progressText =
    totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks completed` : "No tasks yet";

  return (
    <article
      className="
        group flex items-center gap-4 rounded-2xl border border-slate-200/60
        bg-white p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        transition-all duration-200 ease-out
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5
      "
    >
      {/* Left: circular icon / avatar */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
      >
        <FolderKanban className="h-6 w-6" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-slate-800 truncate">
          {project.ProjectName}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{progressText}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">
            {project.users?.UserName ?? "—"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pillClass}`}
          >
            <StatusIcon className="h-3 w-3" strokeWidth={2.5} />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <CircularProgress value={project.completion ?? 0} />
      </div>
    </article>
  );
}
