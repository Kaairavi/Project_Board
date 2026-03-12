"use client";

import { useRouter } from "next/navigation";
import { ProjectCard } from "./ProjectCardAdmin";
import { DeleteButton } from "./DeleteButton";
import type { DeleteProjectResult } from "@/app/admin/actions";

type DeleteProjectAction = (projectId: number) => Promise<DeleteProjectResult>;

type ProjectCardWithDeleteProps = {
  project: Parameters<typeof ProjectCard>[0]["project"];
  deleteAction: DeleteProjectAction;
  /** Optional: project name for confirm message */
  projectName?: string;
};

export function ProjectCardWithDelete({
  project,
  deleteAction,
  projectName,
}: ProjectCardWithDeleteProps) {
  const router = useRouter();
  const name = projectName ?? project.ProjectName ?? "this project";

  const handleDelete = async () => {
    const result = await deleteAction(project.ProjectID);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <ProjectCard
      project={project}
      actions={
        <DeleteButton
          variant="icon"
          ariaLabel={`Delete ${name}`}
          confirmTitle={`Delete "${name}"?`}
          confirmDescription="All task lists and tasks in this project will be permanently removed. This cannot be undone."
          onConfirm={handleDelete}
        />
      }
    />
  );
}
