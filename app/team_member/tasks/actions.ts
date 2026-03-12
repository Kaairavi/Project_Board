"use server";

import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import { revalidatePath } from "next/cache";

export async function updateTaskStatus(taskId: number, newStatus: string) {
    const session = await getSession();
    if (!session || !session.userId) {
        throw new Error("Unauthorized");
    }

    const userId = session.userId;

    // Verify task belongs to user (or user has permission)
    const task = await prisma.tasks.findUnique({
        where: { TaskID: taskId },
    });

    if (!task) {
        throw new Error("Task not found");
    }

    if (task.AssignedTo !== userId) {
        throw new Error("Unauthorized: Task not assigned to you");
    }

    if (task.Status === "Completed") {
        throw new Error("Cannot modify a completed task.");
    }

    await prisma.tasks.update({
        where: { TaskID: taskId },
        data: { Status: newStatus },
    });

    // Log in task_history
    await prisma.task_history.create({
        data: {
            TaskID: taskId,
            ChangedBy: userId,
            ChangeType: `Status changed to ${newStatus}`,
            ChangeTime: new Date(),
        },
    });

    revalidatePath("/team_member/tasks");
    revalidatePath("/team_member/dashboard");
}

export async function addTaskComment(taskId: number, commentText: string) {
    const session = await getSession();
    if (!session || !session.userId) {
        throw new Error("Unauthorized");
    }

    const userId = session.userId;

    const task = await prisma.tasks.findUnique({
        where: { TaskID: taskId },
    });

    if (!task) {
        throw new Error("Task not found");
    }

    if (task.Status === "Completed") {
        throw new Error("Cannot add comments to a completed task.");
    }

    await prisma.task_comments.create({
        data: {
            TaskID: taskId,
            UserID: userId,
            CommentText: commentText,
            CreatedAt: new Date().toISOString(),
        },
    });

    revalidatePath("/team_member/tasks");
    revalidatePath("/team_member/dashboard");
}
