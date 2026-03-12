import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileCard from "@/app/ui_components/ProfileCard";

export default async function TeamMemberProfilePage() {
    const session = await getSession();

    if (!session || (session.role !== "Team_Member" && session.role !== "Admin")) {
        redirect("/auth");
    }

    const user = await prisma.users.findUnique({
        where: { UserID: session.userId },
    });

    if (!user) {
        redirect("/auth");
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-md">
                {/* Navigation Link */}
                <Link
                    href="/team_member/dashboard"
                    className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                    <div className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Dashboard
                </Link>

                {/* Profile Card component */}
                <ProfileCard user={user} basePath="/team_member" />

                {/* Footer info */}
                <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-wide">
                    PROJECT MANAGEMENT SYSTEM v1.0
                </p>
            </div>
        </div>
    );
}
