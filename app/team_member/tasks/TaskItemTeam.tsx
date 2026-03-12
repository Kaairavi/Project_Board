"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus, addTaskComment } from "./actions";
import { MessageSquare, CalendarIcon, Send, RefreshCw } from "lucide-react";

function formatDate(d: Date | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: new Date(d).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
}

function PriorityBadge({ value }: { value: string | null }) {
    if (!value) return <span className="text-slate-400">—</span>;
    const map: Record<string, string> = {
        High: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
        Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    };
    const className = map[value] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${className}`}>
            {value}
        </span>
    );
}

export default function TaskItemTeam({ task }: { task: any }) {
    const [isPending, startTransition] = useTransition();
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentText, setCommentText] = useState("");

    const isOverdue = task.DueDate && new Date(task.DueDate) < new Date() && task.Status !== "Completed";

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        startTransition(async () => {
            try {
                await updateTaskStatus(task.TaskID, newStatus);
            } catch (error) {
                console.error("Failed to update status", error);
                alert("Failed to update status.");
            }
        });
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        startTransition(async () => {
            try {
                await addTaskComment(task.TaskID, commentText);
                setCommentText("");
                setShowCommentBox(false);
            } catch (error) {
                console.error("Failed to add comment", error);
                alert("Failed to add comment.");
            }
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm mb-4 transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {task.Title}
                    </h3>
                    {task.Description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            {task.Description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <PriorityBadge value={task.Priority} />

                        {task.DueDate && (
                            <div className={`text-xs px-2 py-1 flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 border ${isOverdue ? 'border-red-500/20 text-red-600 dark:text-red-400 font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                <CalendarIcon className="size-3" />
                                {formatDate(task.DueDate)}
                            </div>
                        )}
                        <span className="text-xs text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800">
                            List: {task.tasklists?.ListName}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <div className="relative">
                        <select
                            value={task.Status || "Pending"}
                            onChange={handleStatusChange}
                            disabled={isPending || task.Status === "Completed"}
                            className="text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3 pr-8 shadow-sm disabled:opacity-50 appearance-none disabled:cursor-not-allowed"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            {isPending ? <RefreshCw className="size-4 animate-spin" /> : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCommentBox(!showCommentBox)}
                        disabled={task.Status === "Completed"}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={task.Status === "Completed" ? "Cannot add comments to completed tasks" : "Add Comment"}
                    >
                        <MessageSquare className="size-5" />
                    </button>
                </div>
            </div>

            {/* Comment Section & History Preview */}
            {(showCommentBox || (task.task_comments && task.task_comments.length > 0)) && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {task.task_comments && task.task_comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            <h4 className="text-xs font-semibold uppercase text-slate-400">Comments</h4>
                            {task.task_comments.map((comment: any) => (
                                <div key={comment.CommentID} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                    <p>{comment.CommentText}</p>
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        {new Date(comment.CreatedAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {showCommentBox && (
                        <div className="flex gap-2 items-start mt-2">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write an update or comment..."
                                className="flex-1 min-h-[80px] text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-emerald-500 focus:border-emerald-500 p-3 shadow-sm resize-y"
                                disabled={isPending}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isPending || !commentText.trim()}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-auto h-10"
                            >
                                {isPending ? <RefreshCw className="size-4 animate-spin" /> : "Post"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
