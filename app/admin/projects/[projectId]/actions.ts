"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/lib/session";

export async function editTask(taskId: number, projectId: number, formData: FormData) {
    try {
        const session = await getSession();
        const adminId = session?.userId;
        if (!adminId || session?.role !== "Admin") return { error: "Not authorized." };

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const priority = formData.get("priority") as string;
        const assignedTo = formData.get("assignedTo") as string;
        const dueDateStr = formData.get("dueDate") as string;

        if (!title || !priority || !dueDateStr) {
            return { error: "Missing required fields." };
        }

        const assignedUserId = assignedTo ? Number(assignedTo) : null;
        const dueDate = new Date(dueDateStr);

        await prisma.$transaction(async (tx) => {
            await tx.tasks.update({
                where: { TaskID: taskId },
                data: {
                    AssignedTo: assignedUserId,
                    Title: title,
                    Description: description || null,
                    Priority: priority,
                    DueDate: dueDate,
                },
            });

            await tx.task_history.create({
                data: {
                    TaskID: taskId,
                    ChangedBy: adminId,
                    ChangeType: "Task Updated",
                    ChangeTime: new Date(),
                },
            });
        });

        revalidatePath(`/admin/projects/${projectId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        return { error: "Failed to update task. Please try again." };
    }
}
