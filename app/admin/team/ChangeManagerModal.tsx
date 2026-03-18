"use client";

import { useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, X, Briefcase, ChevronDown, Check } from "lucide-react";
import { updateProjectManager } from "./actions";

type Manager = { UserID: number; UserName: string };

function SubmitButton({ selectedId }: { selectedId: number | null }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending || !selectedId}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
            {pending ? "Saving..." : "Save"}
        </button>
    );
}

export function ChangeManagerModal({
    projectId,
    projectName,
    currentManagerId,
    managers,
}: {
    projectId: number;
    projectName: string;
    currentManagerId: number | null;
    managers: Manager[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedManagerId, setSelectedManagerId] = useState<number | null>(currentManagerId);

    // Custom dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    async function action(formData: FormData) {
        setError(null);
        if (!selectedManagerId) {
            setError("Please select a manager.");
            return;
        }
        const result = await updateProjectManager(projectId, selectedManagerId);
        if (result.error) {
            setError(result.error);
        } else {
            setIsOpen(false);
        }
    }

    const selectedManager = managers.find(m => m.UserID === selectedManagerId);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Change manager"
            >
                <Pencil className="size-3 text-slate-400 dark:text-slate-500" />
                Change
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-visible">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                    <Briefcase className="size-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Change Manager</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{projectName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                type="button"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form action={action} className="px-5 py-5 overflow-visible">
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Manager
                            </label>

                            {/* Custom Dropdown */}
                            <div className="relative mb-5" ref={dropdownRef}>
                                <div
                                    className="flex w-full items-center justify-between cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600 transition-shadow"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={`text-sm ${selectedManager ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                        {selectedManager ? selectedManager.UserName.replace(/_/g, " ") : "Select a manager…"}
                                    </span>
                                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white/10 overflow-hidden py-1 max-h-60 overflow-y-auto">
                                        {managers.map(m => (
                                            <div
                                                key={m.UserID}
                                                className={`flex items-center justify-between cursor-pointer px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedManagerId === m.UserID ? "bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                                                onClick={() => {
                                                    setSelectedManagerId(m.UserID);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {m.UserName.replace(/_/g, " ")}
                                                {selectedManagerId === m.UserID && (
                                                    <Check className="size-4 text-indigo-600 dark:text-indigo-400" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input type="hidden" name="managerId" value={selectedManagerId ?? ""} />

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <SubmitButton selectedId={selectedManagerId} />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
