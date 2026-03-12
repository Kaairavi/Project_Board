"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { X, Calendar as CalendarIcon, User as UserIcon, Flag, AlignLeft, Type, Edit2 } from "lucide-react";
import { editTask } from "./actions";

type TeamMember = {
    UserID: number;
    UserName: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
        >
            {pending ? (
                "Saving..."
            ) : (
                <>
                    <Edit2 className="-ml-0.5 size-4" />
                    Save Changes
                </>
            )}
        </button>
    );
}

export function EditTaskModal({
    projectId,
    teamMembers,
    task,
}: {
    projectId: number;
    teamMembers: TeamMember[];
    task: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function action(formData: FormData) {
        setError(null);
        let result = await editTask(task.TaskID, projectId, formData);

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
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                title="Edit Task"
            >
                <Edit2 className="size-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Edit Task
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 transition-colors"
                                type="button"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form action={action} ref={formRef} className="px-6 py-6 sm:px-8">
                            {error && (
                                <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <Type className="size-4 text-slate-400" />
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        defaultValue={task.Title || ""}
                                        required
                                        className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm bg-white dark:bg-slate-800"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <AlignLeft className="size-4 text-slate-400" />
                                        Description <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        defaultValue={task.Description || ""}
                                        rows={3}
                                        className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm bg-white dark:bg-slate-800 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Assigned To */}
                                    <div>
                                        <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <UserIcon className="size-4 text-slate-400" />
                                                Assign To
                                            </span>
                                            <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                                        </label>
                                        <select
                                            name="assignedTo"
                                            id="assignedTo"
                                            className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm bg-white dark:bg-slate-800"
                                            defaultValue={task.AssignedTo || ""}
                                        >
                                            <option value="" className="text-slate-400">Unassigned</option>
                                            {teamMembers.map((member) => (
                                                <option key={member.UserID} value={member.UserID}>
                                                    {member.UserName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                            <Flag className="size-4 text-slate-400" />
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            id="priority"
                                            required
                                            className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm bg-white dark:bg-slate-800"
                                            defaultValue={task.Priority || "Medium"}
                                        >
                                            <option value="High">High 🔴</option>
                                            <option value="Medium">Medium 🟡</option>
                                            <option value="Low">Low 🟢</option>
                                        </select>
                                    </div>

                                    {/* Due Date */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                            <CalendarIcon className="size-4 text-slate-400" />
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            id="dueDate"
                                            required
                                            defaultValue={task.DueDate ? new Date(task.DueDate).toISOString().split("T")[0] : ""}
                                            className="block w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm bg-white dark:bg-slate-800"
                                        />
                                    </div>
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
