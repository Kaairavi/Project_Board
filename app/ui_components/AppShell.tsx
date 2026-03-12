"use client";

import { useState } from "react";

interface AppShellProps {
    children: React.ReactNode;
    userName?: string;
    Sidebar: React.ComponentType<{ isCollapsed: boolean; setIsCollapsed: (val: boolean) => void; userName?: string }>;
}

export default function AppShell({ children, Sidebar, userName }: AppShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} userName={userName} />
            <main
                className={`flex-1 p-5 md:p-6 min-w-0 overflow-x-hidden transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    );
}
