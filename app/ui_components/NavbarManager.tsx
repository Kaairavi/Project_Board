"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, Suspense, useRef, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";

function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearchTerm(searchParams.get("q") ?? "");
    }, [searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (val) {
                params.set("q", val);
            } else {
                params.delete("q");
            }
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300);
    };

    return (
        <div className="relative group flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Search your projects..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full sm:w-80 pl-10 pr-12 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
            <div className="absolute right-3 hidden sm:flex items-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    ⌘K
                </span>
            </div>
        </div>
    );
}

export default function NavbarManager({ userName }: { userName?: string }) {
    const initials = userName
        ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "M";

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-30">
            <Suspense fallback={
                <div className="relative flex items-center opacity-50">
                    <div className="absolute left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your projects..."
                        className="w-full sm:w-80 pl-10 pr-12 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent rounded-full text-sm placeholder:text-slate-400"
                        disabled
                    />
                </div>
            }>
                <SearchInput />
            </Suspense>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">{userName || "Manager User"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Project Lead</p>
                    </div>
                    <Link href="/manager/profile" title="Manager Profile">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-500/20 ring-2 ring-white dark:ring-slate-800 cursor-pointer hover:opacity-90 transition-opacity uppercase">
                            {initials}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

