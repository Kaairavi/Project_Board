"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect, Suspense } from "react";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, pathname, router]);

  return (
    <input
      type="text"
      placeholder="Search projects..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-64 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

export default function Navbar({ userName }: { userName?: string }) {
  const initials = userName
    ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <Suspense fallback={
        <input
          type="text"
          placeholder="Search projects..."
          className="w-64 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled
        />
      }>
        <SearchInput />
      </Suspense>

      <div className="flex items-center gap-4">
        <Link href="/admin/profile" title="Admin Profile">
          <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity uppercase">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

