"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/lib/session";

export async function addTask(projectId: number, formData: FormData) {
    try {
        const session = await getSession();
        const managerId = session?.userId;

        if (!managerId) {
            return { error: "Not authorized." };
        }

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

        // 1. Get or create a default tasklist for this project
        let tasklist = await prisma.tasklists.findFirst({
            where: { ProjectID: projectId },
        });

        if (!tasklist) {
            tasklist = await prisma.tasklists.create({
                data: {
                    ProjectID: projectId,
                    ListName: "General Tasks",
                },
            });
        }

        // 2. Create the task and history within a transaction
        await prisma.$transaction(async (tx) => {
            const newTask = await tx.tasks.create({
                data: {
                    ListID: tasklist.ListID,
                    AssignedTo: assignedUserId,
                    Title: title,
                    Description: description || null,
                    Priority: priority,
                    Status: "Pending",
                    CreatedAt: new Date(),
                    DueDate: dueDate,
                },
            });

            await tx.task_history.create({
                data: {
                    TaskID: newTask.TaskID,
                    ChangedBy: managerId,
                    ChangeType: "Task Created",
                    ChangeTime: new Date(),
                },
            });
        });

        revalidatePath(`/manager/projects/${projectId}`);
        revalidatePath(`/manager/dashboard`);

        return { success: true };
    } catch (error) {
        console.error("Error creating task:", error);
        return { error: "Failed to create task. Please try again." };
    }
}

export async function editTask(taskId: number, projectId: number, formData: FormData) {
    try {
        const session = await getSession();
        const managerId = session?.userId;
        if (!managerId) return { error: "Not authorized." };

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
                    ChangedBy: managerId,
                    ChangeType: "Task Updated",
                    ChangeTime: new Date(),
                },
            });
        });

        revalidatePath(`/manager/projects/${projectId}`);
        revalidatePath(`/manager/dashboard`);

        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        return { error: "Failed to update task. Please try again." };
    }
}

export async function deleteTask(taskId: number, projectId: number) {
    try {
        const session = await getSession();
        if (!session?.userId) return { error: "Not authorized." };

        await prisma.$transaction(async (tx) => {
            await tx.task_history.deleteMany({ where: { TaskID: taskId } });
            await tx.task_comments.deleteMany({ where: { TaskID: taskId } });
            await tx.tasks.delete({ where: { TaskID: taskId } });
        });

        revalidatePath(`/manager/projects/${projectId}`);
        revalidatePath(`/manager/dashboard`);

        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        return { error: "Failed to delete task. Please try again." };
    }
}
