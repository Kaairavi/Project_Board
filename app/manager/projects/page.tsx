import { prisma } from '@/app/lib/prisma'
import NavbarManager from '@/app/ui_components/NavbarManager'
import ProjectCard from '@/app/ui_components/projects/ProjectCard'
import { FolderKanban } from 'lucide-react'
import { getSession } from '@/app/lib/session'

export default async function ManagerProjects({
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
        orderBy: {
            CreatedAt: 'desc'
        }
    });

    const now = new Date();

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

        const activeMembersCount = new Set(
            tasks.filter(t => t.AssignedTo).map(t => t.AssignedTo)
        ).size;

        return {
            ...project,
            totalTasks,
            completedTasks,
            completion,
            activeMembersCount
        };
    });

    const currentUser = await prisma.users.findUnique({ where: { UserID: managerId } });

    return (
        <>
            <NavbarManager userName={currentUser?.UserName} />
            <section className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-6 pb-20">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            My Projects
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage and review all your assigned project activities
                        </p>
                    </div>
                </header>

                {projectsWithStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {projectsWithStats.map((project) => (
                            <ProjectCard key={project.ProjectID} project={project} variant="manager" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/10 py-24 px-6 text-center shadow-sm">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 mb-5 shadow-inner">
                            <FolderKanban className="size-8" strokeWidth={1.5} aria-hidden />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                            No projects found
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                            {q ? `We couldn't find any projects matching "${q}". Try clearing your search.` : "You haven't been assigned to any projects yet. When you are, they'll show up here."}
                        </p>
                    </div>
                )}
            </section>
        </>
    )
}