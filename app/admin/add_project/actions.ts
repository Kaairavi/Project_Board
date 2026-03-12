"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export type CreateProjectState = {
  error?: string;
};

export async function createProject(
  _prev: CreateProjectState | undefined,
  formData: FormData
): Promise<CreateProjectState> {
  const name = formData.get("projectName") as string | null;
  const description = (formData.get("description") as string | null) || null;
  const createdByRaw = formData.get("createdBy") as string | null;
  const createdBy = createdByRaw ? parseInt(createdByRaw, 10) : null;

  if (!name?.trim()) {
    return { error: "Project name is required." };
  }

  try {
    await prisma.projects.create({
      data: {
        ProjectName: name.trim(),
        Description: description?.trim() || null,
        CreatedBy: createdBy && Number.isFinite(createdBy) ? createdBy : null,
        CreatedAt: new Date(),
      },
    });
  } catch (e) {
    console.error(e);
    return { error: "Failed to create project. Please try again." };
  }

  redirect("/admin/projects");
}
