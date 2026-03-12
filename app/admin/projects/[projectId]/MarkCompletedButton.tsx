"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { markTaskCompleted } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/app/ui_components/ConfirmDialog";

export function MarkCompletedButton({
    taskId,
    projectId,
    basePath = '/admin'
}: {
    taskId: number;
    projectId: number;
    basePath?: string;
}) {
    const [isPending, setIsPending] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsPending(true);
        const result = await markTaskCompleted(taskId, projectId, basePath);
        setIsPending(false);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                disabled={isPending}
                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${isPending
                    ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                title="Mark as completed"
            >
                <CheckCircle2 className="size-4" aria-hidden />
            </button>

            <ConfirmDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                onConfirm={handleConfirm}
                title="Mark task as completed?"
                description="This will update the task status to completed and notify assigned members."
                confirmLabel="Complete Task"
                cancelLabel="Cancel"
                variant="success"
            />
        </>
    );
}
