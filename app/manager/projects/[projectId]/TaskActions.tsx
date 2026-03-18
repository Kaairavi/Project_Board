"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { AddTaskModal } from "./AddTaskModal";
import { deleteTask } from "./actions";

export function TaskActions({ task, projectId, teamMembers }: { task: any; projectId: number; teamMembers: any[] }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteTask(task.TaskID, projectId);
        if (result?.error) {
            alert(result.error);
        }
        setIsDeleting(false);
        setShowDeleteModal(false);
    }

    return (
        <div className="flex items-center gap-1 justify-end">
            <AddTaskModal projectId={projectId} teamMembers={teamMembers} task={task} />
            <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Delete Task"
            >
                <Trash2 className="size-4" />
            </button>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => !isDeleting && setShowDeleteModal(false)}
                    />
                    <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-800">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="size-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Delete Task
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() => !isDeleting && setShowDeleteModal(false)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{task.Title}"</span>? This action cannot be undone and will permanently remove all associated history and comments.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="-ml-0.5 size-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Task"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
