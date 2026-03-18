"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
    UserPlus, X, Mail, Lock, User as UserIcon, Shield, Eye, EyeOff, Loader2
} from "lucide-react";
import { createStaff } from "./actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
        >
            {pending ? (
                <>
                    <Loader2 className="-ml-0.5 size-4 animate-spin" />
                    Creating...
                </>
            ) : (
                <>
                    <UserPlus className="-ml-0.5 size-4" />
                    Create Staff
                </>
            )}
        </button>
    );
}

export function AddStaffModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function action(formData: FormData) {
        setError(null);
        const result = await createStaff(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsOpen(false);
            formRef.current?.reset();
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
                <UserPlus className="size-4" />
                Add Staff
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                    <UserPlus className="size-4" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Add New Staff Member
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 transition-colors"
                                type="button"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form action={action} ref={formRef} className="px-6 py-6 sm:px-8">
                            {error && (
                                <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Username */}
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <UserIcon className="size-4 text-slate-400" />
                                            Username
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        required
                                        autoComplete="off"
                                        className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-800"
                                        placeholder="e.g., john_doe"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="size-4 text-slate-400" />
                                            Email Address
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        autoComplete="off"
                                        className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-800"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <Lock className="size-4 text-slate-400" />
                                            Password
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            required
                                            minLength={6}
                                            className="block w-full rounded-xl border-0 py-2.5 px-3.5 pr-10 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-800"
                                            placeholder="Min. 6 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <Shield className="size-4 text-slate-400" />
                                            Role
                                        </span>
                                    </label>
                                    <select
                                        name="role"
                                        id="role"
                                        required
                                        defaultValue="Team_Member"
                                        className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-800"
                                    >
                                        <option value="Team_Member">Team Member</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        The user will be able to log in immediately with these credentials.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
