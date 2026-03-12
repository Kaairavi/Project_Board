"use client";

import { useState, useTransition } from "react";
import { User, Mail, Shield, Calendar, LogOut, Edit2, Check, X, Loader2 } from "lucide-react";
import { logout, updateUserProfile } from "@/app/lib/actions";

interface ProfileCardProps {
    user: {
        UserID: number;
        UserName: string;
        Email: string;
        CreatedAt: Date | null;
    };
    basePath: string; // e.g., "/admin", "/manager", "/team_member"
}

export default function ProfileCard({ user, basePath }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user.UserName);
    const [email, setEmail] = useState(user.Email);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleUpdate = async () => {
        setError(null);
        startTransition(async () => {
            const result = await updateUserProfile({ username, email, basePath });
            if (result.error) {
                setError(result.error);
            } else {
                setIsEditing(false);
            }
        });
    };

    const initials = getInitials(username);
    const themeColor = basePath === "/team_member" ? "emerald" : "indigo";
    const bgGradient = basePath === "/team_member"
        ? "from-emerald-500 via-teal-500 to-cyan-600"
        : "from-indigo-500 via-purple-500 to-violet-600";

    const accentBg = basePath === "/team_member" ? "bg-emerald-50" : "bg-indigo-50";
    const accentText = basePath === "/team_member" ? "text-emerald-600" : "text-indigo-600";
    const accentBorder = basePath === "/team_member" ? "border-emerald-200" : "border-indigo-200";
    const accentFocusBorder = basePath === "/team_member" ? "focus:border-emerald-600" : "focus:border-indigo-600";
    const accentButton = basePath === "/team_member" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700";

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            {/* Decorative Header */}
            <div className={`h-24 bg-linear-to-r ${bgGradient}`}></div>

            <div className="px-8 pb-10">
                {/* Avatar Section */}
                <div className="relative -mt-12 flex justify-center mb-10">
                    <div className="relative">
                        <div className="h-28 w-28 rounded-3xl bg-white p-1.5 shadow-xl">
                            <div className={`h-full w-full rounded-2xl bg-linear-to-br ${bgGradient} flex items-center justify-center text-white text-4xl font-bold border-4 border-slate-50 uppercase`}>
                                {initials}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <div className={`${basePath === "/team_member" ? "bg-emerald-500" : "bg-indigo-500"} border-4 border-white rounded-full p-2 shadow-md`}>
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Text */}
                <div className="text-center mb-10 relative">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {basePath === "/admin" ? "Admin" : basePath === "/manager" ? "Manager" : "Team Member"} Profile
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account</p>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`absolute top-0 right-0 p-2 text-slate-400 hover:${accentText} transition-colors`}
                    >
                        {isEditing ? <X className="size-5" /> : <Edit2 className="size-5" />}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-2">
                        <X className="size-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Vertical Details List */}
                <div className="space-y-4 mb-10">
                    <div className="group p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:scale-[1.02] rounded-2xl border border-slate-100 transition-all duration-300">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-1">Username</p>
                        <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg ${accentBg} flex items-center justify-center ${accentText}`}>
                                <User className="w-4 h-4" />
                            </div>
                            {isEditing ? (
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`bg-transparent border-b ${accentBorder} ${accentFocusBorder} outline-none flex-1 text-slate-700 font-semibold py-0.5`}
                                />
                            ) : (
                                <span className="text-slate-700 font-semibold">{username}</span>
                            )}
                        </div>
                    </div>

                    <div className="group p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:scale-[1.02] rounded-2xl border border-slate-100 transition-all duration-300">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-1">Email Address</p>
                        <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg ${accentBg} flex items-center justify-center ${accentText}`}>
                                <Mail className="w-4 h-4" />
                            </div>
                            {isEditing ? (
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`bg-transparent border-b ${accentBorder} ${accentFocusBorder} outline-none flex-1 text-slate-700 font-semibold py-0.5`}
                                />
                            ) : (
                                <span className="text-slate-700 font-semibold">{email}</span>
                            )}
                        </div>
                    </div>

                    <div className="group p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-1">Access Level</p>
                        <div className="flex items-center gap-3 opacity-60">
                            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-slate-700 font-semibold">
                                {basePath === "/admin" ? "System Administrator" : basePath === "/manager" ? "Project Manager" : "Team Member"}
                            </span>
                        </div>
                    </div>

                    <div className="group p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-1">Member Since</p>
                        <div className="flex items-center gap-3 opacity-60">
                            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-slate-700 font-semibold">
                                {user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {isEditing ? (
                        <button
                            onClick={handleUpdate}
                            disabled={isPending}
                            className={`w-full flex items-center justify-center gap-2 py-4 px-6 ${accentButton} text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50`}
                        >
                            {isPending ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                            Save Changes
                        </button>
                    ) : (
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-red-200 transition-all duration-300 active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
