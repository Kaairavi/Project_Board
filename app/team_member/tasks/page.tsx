import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import TaskItemTeam from "./TaskItemTeam";
import NavbarTeamMember from "@/app/ui_components/NavbarTeamMember";
import { Layers } from "lucide-react";

export default async function TeamMemberTasksPage({
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

    const tasks = await prisma.tasks.findMany({
        where: {
            AssignedTo: userId,
            Title: { contains: q },
        },
        include: {
            tasklists: {
                include: {
                    projects: true,
                },
            },
            task_comments: {
                orderBy: {
                    CreatedAt: 'desc'
                }
            }
        },
        orderBy: {
            DueDate: 'asc',
        },
    });

    // Group tasks by Project Name
    const groupedTasks = tasks.reduce((acc, task) => {
        const projectName = task.tasklists?.projects?.ProjectName || "Unassigned Project";
        if (!acc[projectName]) {
            acc[projectName] = [];
        }
        acc[projectName].push(task);
        return acc;
    }, {} as Record<string, typeof tasks>);

    const currentUser = await prisma.users.findUnique({ where: { UserID: userId } });

    return (
        <>
            <NavbarTeamMember userName={currentUser?.UserName} />
            <div className="p-5 md:p-6 pb-20 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Layers className="size-6 text-emerald-600" />
                        My Tasks
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View and manage all tasks assigned to you, grouped by project.
                    </p>
                </header>

                {Object.keys(groupedTasks).length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No tasks found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                            <section key={projectName} className="relative">
                                <div className="sticky top-16 z-10 bg-slate-50/90 dark:bg-[#0B1120]/90 backdrop-blur-sm p-4 -mx-4 mb-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                        {projectName}
                                    </h2>
                                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-1 rounded-full">
                                        {projectTasks.length} {projectTasks.length === 1 ? 'Task' : 'Tasks'}
                                    </span>
                                </div>

                                <div>
                                    {projectTasks.map(task => (
                                        <TaskItemTeam key={task.TaskID} task={task} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
