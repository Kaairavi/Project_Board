import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import NavbarAdmin from "@/app/ui_components/NavbarAdmin";
import { AddStaffModal } from "./AddStaffModal";
import { ChangeManagerModal } from "./ChangeManagerModal";
import {
    Users, FolderKanban, Mail, ShieldCheck, User,
    Briefcase, UserCheck,
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────── */
function isManager(role: string) { return role === "Manager"; }

function roleColor(role: string) {
    return isManager(role)
        ? { avatar: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20" }
        : { avatar: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20" };
}

function RoleBadge({ role }: { role: string }) {
    const { badge } = roleColor(role);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge}`}>
            <ShieldCheck className="size-3" />
            {isManager(role) ? "Manager" : "Team Member"}
        </span>
    );
}

function UserAvatar({ role }: { role: string }) {
    const { avatar } = roleColor(role);
    return (
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${avatar}`}>
            <User className="size-4" />
        </div>
    );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm p-5">
            <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── page ────────────────────────────────────────── */
export default async function AdminTeamPage() {
    const session = await getSession();
    if (!session?.userId || session?.role !== "Admin") redirect("/login");

    const currentUser = await prisma.users.findUnique({ where: { UserID: session.userId } });

    // All projects with assigned members (via tasks)
    const projects = await prisma.projects.findMany({
        include: {
            users: {
                include: { user_roles: { include: { roles: true } } },
            },
            tasklists: {
                include: {
                    tasks: {
                        where: { AssignedTo: { not: null } },
                        include: {
                            users: {
                                include: { user_roles: { include: { roles: true } } },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { CreatedAt: "desc" },
    });

    const projectsWithMembers = projects.map((project) => {
        const memberMap = new Map<number, { UserID: number; UserName: string; Email: string; role: string }>();
        project.tasklists.forEach((list) => {
            list.tasks.forEach((task) => {
                if (task.users && !memberMap.has(task.users.UserID)) {
                    const role = task.users.user_roles[0]?.roles?.RoleName ?? "Team_Member";
                    memberMap.set(task.users.UserID, {
                        UserID: task.users.UserID,
                        UserName: task.users.UserName,
                        Email: task.users.Email,
                        role,
                    });
                }
            });
        });
        return { ...project, members: Array.from(memberMap.values()) };
    });

    // All staff
    const allStaff = await prisma.users.findMany({
        where: {
            user_roles: {
                some: { roles: { RoleName: { in: ["Team_Member", "Manager"] } } },
            },
        },
        include: { user_roles: { include: { roles: true } } },
        orderBy: { UserName: "asc" },
    });

    // Managers only (for the change-manager dropdown)
    const allManagers = await prisma.users.findMany({
        where: {
            user_roles: {
                some: { roles: { RoleName: "Manager" } },
            },
        },
        select: { UserID: true, UserName: true },
        orderBy: { UserName: "asc" },
    });

    const managerCount = allStaff.filter((u) => u.user_roles[0]?.roles?.RoleName === "Manager").length;
    const memberCount = allStaff.length - managerCount;

    return (
        <>
            <NavbarAdmin userName={currentUser?.UserName} />
            <section className="min-h-[calc(100vh-4rem)] bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-5 md:p-8">

                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Team Management
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            View team members across all projects and manage staff accounts
                        </p>
                    </div>
                    <AddStaffModal />
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Staff" value={allStaff.length} icon={Users} />
                    <StatCard label="Managers" value={managerCount} icon={Briefcase} />
                    <StatCard label="Team Members" value={memberCount} icon={UserCheck} />
                </div>

                {/* Members by project */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                        Members by Project
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {projectsWithMembers.map((project) => (
                            <div
                                key={project.ProjectID}
                                className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-shadow p-5"
                            >
                                {/* Project title row */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        <FolderKanban className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                            {project.ProjectName}
                                        </p>
                                        {/* Manager with inline change button */}
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Manager:{" "}
                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                    {project.users?.UserName?.replace(/_/g, " ") ?? "—"}
                                                </span>
                                            </span>
                                            <ChangeManagerModal
                                                projectId={project.ProjectID}
                                                projectName={project.ProjectName}
                                                currentManagerId={project.CreatedBy}
                                                managers={allManagers}
                                            />
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                        {project.members.length}
                                    </span>
                                </div>

                                {/* Member rows */}
                                {project.members.length === 0 ? (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                                        No members assigned via tasks yet
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {project.members.map((m) => (
                                            <div key={m.UserID} className="flex items-center gap-3">
                                                <UserAvatar role={m.role} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                                        {m.UserName.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                        {m.Email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* All staff table */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
                        <Users className="size-4 text-slate-500 dark:text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Staff</h2>
                        <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                            {allStaff.length} total
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                                {allStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            No staff members yet. Click "Add Staff" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    allStaff.map((user) => {
                                        const role = user.user_roles[0]?.roles?.RoleName ?? "Team_Member";
                                        return (
                                            <tr key={user.UserID} className="hover:bg-slate-50 dark:hover:bg-slate-700/25 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar role={role} />
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                                            {user.UserName.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="size-3.5 text-slate-400 shrink-0" />
                                                        {user.Email}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <RoleBadge role={role} />
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
