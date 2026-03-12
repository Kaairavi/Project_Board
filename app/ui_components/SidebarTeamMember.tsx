"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ListTodo, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { logout } from "@/app/lib/actions";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    userName?: string;
}

function NavItem({
    label,
    href,
    active = false,
    icon: Icon,
    isCollapsed,
}: {
    label: string;
    href: string;
    active?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    isCollapsed: boolean;
}) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`flex items-center gap-3 py-2.5 rounded-xl cursor-pointer transition relative group
          ${isCollapsed ? "justify-center px-0" : "px-3"}
          ${active
                        ? "bg-white text-emerald-600 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-slate-800 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
            >
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                >
                    <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                )}

                {isCollapsed && (
                    <div className="absolute left-14 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                        {label}
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

export default function SidebarTeamMember({ isCollapsed, setIsCollapsed, userName }: SidebarProps) {
    const pathname = usePathname();
    const isDashboard = pathname === "/team_member/dashboard" || pathname === "/team_member";
    const displayName = userName
        ? (userName === "Team_Member" ? "Team Member" : userName.replace(/_/g, " "))
        : "Team Member";
    const initials = displayName
        ? displayName.split(/[\s_-]+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "T";

    return (
        <aside
            className={`fixed top-0 left-0 h-full z-40 bg-slate-100/80 dark:bg-slate-900/50 border-r border-slate-200/80 dark:border-slate-800 px-4 py-5 flex flex-col transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-emerald-600 dark:bg-slate-800 dark:border-slate-700 transition-all z-50"
            >
                {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
            </button>

            {/* Logo */}
            <div className={`flex items-center gap-3 mb-8 overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-2"}`}>
                <div className="flex-shrink-0 size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                    PB
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap"
                    >
                        Project<span className="text-emerald-600">Board</span> <span className="text-xs font-normal text-slate-400 align-top">Team</span>
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
                <NavItem
                    href="/team_member/dashboard"
                    label="Dashboard"
                    active={isDashboard}
                    icon={LayoutDashboard}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    href="/team_member/tasks"
                    label="My Tasks"
                    active={pathname.startsWith("/team_member/tasks")}
                    icon={ListTodo}
                    isCollapsed={isCollapsed}
                />
            </nav>

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 mt-auto">
                <form action={logout}>
                    <button
                        type="submit"
                        className={`group flex w-full items-center gap-3 py-2.5 rounded-xl transition text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 font-medium cursor-pointer overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-2"}`}
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-red-900/40 dark:group-hover:text-red-400 transition-colors">
                            <LogOut className="h-4 w-4" />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="whitespace-nowrap"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </button>
                </form>
            </div>
        </aside>
    );
}


