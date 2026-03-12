"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/lib/session";

export type DeleteProjectResult = { error?: string };

/** Deletes a project and all related tasklists, tasks, task_comments, and task_history. */
export async function deleteProject(projectId: number): Promise<DeleteProjectResult> {
  if (!Number.isInteger(projectId) || projectId < 1) {
    return { error: "Invalid project." };
  }

  try {
    const tasklists = await prisma.tasklists.findMany({
      where: { ProjectID: projectId },
      select: { ListID: true },
    });
    const listIds = tasklists.map((l) => l.ListID);

    const tasks = await prisma.tasks.findMany({
      where: { ListID: { in: listIds } },
      select: { TaskID: true },
    });
    const taskIds = tasks.map((t) => t.TaskID);

    await prisma.$transaction(async (tx) => {
      if (taskIds.length > 0) {
        await tx.task_comments.deleteMany({ where: { TaskID: { in: taskIds } } });
        await tx.task_history.deleteMany({ where: { TaskID: { in: taskIds } } });
      }
      await tx.tasks.deleteMany({ where: { ListID: { in: listIds } } });
      await tx.tasklists.deleteMany({ where: { ProjectID: projectId } });
      await tx.projects.delete({ where: { ProjectID: projectId } });
    });
  } catch (e) {
    console.error("deleteProject error:", e);
    return { error: "Failed to delete project. Please try again." };
  }

  return {};
}

export async function markTaskCompleted(taskId: number, projectId: number, basePath: string = '/admin') {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      return { error: "Not authorized to modify tasks." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.tasks.update({
        where: { TaskID: taskId },
        data: { Status: "Completed" },
      });

      await tx.task_history.create({
        data: {
          TaskID: taskId,
          ChangedBy: userId,
          ChangeType: "Status changed to Completed",
          ChangeTime: new Date(),
        }
      });
    });

    revalidatePath(`${basePath}/projects/${projectId}`);
    return { success: true };
  } catch (e) {
    console.error("markTaskCompleted error:", e);
    return { error: "Failed to update task status." };
  }
}

