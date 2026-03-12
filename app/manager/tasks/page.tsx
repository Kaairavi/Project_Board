import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import { CheckCircle2, AlertCircle, LayoutList, Clock } from "lucide-react";
import NavbarManager from "@/app/ui_components/NavbarManager";
import { MarkCompletedButton } from "@/app/admin/projects/[projectId]/MarkCompletedButton";
import { TaskActions } from "@/app/manager/projects/[projectId]/TaskActions";

type Priority = "High" | "Medium" | "Low";

function StatusBadge({ value }: { value: string }) {
    const isCompleted = value === "Completed";
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isCompleted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
        >
            {isCompleted ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
            {value}
        </span>
    );
}

function PriorityBadge({ value }: { value: string }) {
    const colors = {
        High: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
        Medium: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
        Low: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    };
    const style = colors[value as Priority] || colors.Medium;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            {value}
        </span>
    );
}

function formatDate(d: Date | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: new Date(d).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
}

function SummaryCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            {children}
        </div>
    );
}

function StatusRow({
    label,
    value,
    valueClass = "text-slate-900 dark:text-white",
}: {
    label: string;
    value: number;
    valueClass?: string;
}) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
            <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
        </div>
    );
}

export default async function ManagerGlobalTasksPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const q = resolvedSearchParams?.q ?? "";
    const session = await getSession();
    const managerId = session?.userId;

    if (!managerId) {
        redirect("/login");
    }

    // Fetch projects directly managed by this manager
    const projects = await prisma.projects.findMany({
        where: { CreatedBy: managerId },
        include: {
            tasklists: {
                include: {
                    tasks: {
                        where: {
                            Title: {
                                contains: q,
                            },
                        },
                        include: {
                            users: true,
                        },
                    },
                },
            },
        },
    });

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

    // Flatten all tasks and inject project ID and Name for context
    const allTasks: any[] = [];
    projects.forEach(project => {
        project.tasklists.forEach(list => {
            list.tasks.forEach(task => {
                allTasks.push({
                    ...task,
                    projectId: project.ProjectID,
                    projectName: project.ProjectName
                });
            });
        });
    });

    // Sort tasks by Due Date by default, placing completed tasks at the bottom
    allTasks.sort((a, b) => {
        if (a.Status === "Completed" && b.Status !== "Completed") return 1;
        if (b.Status === "Completed" && a.Status !== "Completed") return -1;

        const dateA = a.DueDate ? new Date(a.DueDate).getTime() : Infinity;
        const dateB = b.DueDate ? new Date(b.DueDate).getTime() : Infinity;
        return dateA - dateB;
    });

    const stats = allTasks.reduce(
        (acc, task) => {
            acc.totalTasks++;
            if (task.Status === "Completed") acc.completed++;
            else acc.pending++;

            const p = task.Priority as Priority;
            if (acc.priorityCount[p] !== undefined) {
                acc.priorityCount[p]++;
            }
            return acc;
        },
        {
            totalTasks: 0,
            completed: 0,
            pending: 0,
            priorityCount: { High: 0, Medium: 0, Low: 0 },
        }
    );

    const currentUser = managerId
        ? await prisma.users.findUnique({ where: { UserID: managerId } })
        : null;

    return (
        <>
            <NavbarManager userName={currentUser?.UserName} />
            <main className="p-8 max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        All Tasks
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Manage all tasks across every project
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Status Stats */}
                    <SummaryCard>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Clock className="size-4 text-violet-500" />
                            Task Status
                        </h3>
                        <StatusRow label="Total Tasks" value={stats.totalTasks} />
                        <StatusRow label="Pending" value={stats.pending} />
                        <StatusRow
                            label="Completed"
                            value={stats.completed}
                            valueClass="text-emerald-600 dark:text-emerald-400"
                        />
                    </SummaryCard>

                    {/* Priority Stats */}
                    <SummaryCard>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <AlertCircle className="size-4 text-rose-500" />
                            Priority Overview
                        </h3>
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
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <LayoutList className="size-4" aria-hidden />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Global Task List
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Project
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
                                {allTasks.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            No tasks assigned to any active projects yet.
                                        </td>
                                    </tr>
                                ) : (
                                    allTasks.map((task) => {
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
                                                <td className="px-6 py-4 text-xs font-semibold text-violet-600 dark:text-violet-400">
                                                    {task.projectName}
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
                                                            <MarkCompletedButton taskId={task.TaskID} projectId={task.projectId} basePath="/manager" />
                                                        )}
                                                        <TaskActions task={task} projectId={task.projectId} teamMembers={teamMembers} />
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
            </main>
        </>
    );
}
