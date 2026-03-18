"use server";

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/lib/session";

export async function updateProjectManager(projectId: number, newManagerId: number) {
    const session = await getSession();
    if (!session?.userId || session?.role !== "Admin") return { error: "Not authorized." };

    await prisma.projects.update({
        where: { ProjectID: projectId },
        data: { CreatedBy: newManagerId },
    });

    revalidatePath("/admin/team");
    return { success: true };
}

export async function createStaff(formData: FormData) {
    try {
        const session = await getSession();
        if (!session?.userId || session?.role !== "Admin") {
            return { error: "Not authorized." };
        }

        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const roleName = formData.get("role") as string;

        if (!username || !email || !password || !roleName) {
            return { error: "All fields are required." };
        }

        // Check for duplicate email or username
        const existing = await prisma.users.findFirst({
            where: { OR: [{ Email: email }, { UserName: username }] },
        });
        if (existing) {
            return { error: "A user with that email or username already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = await prisma.roles.findUnique({ where: { RoleName: roleName } });
        if (!role) {
            return { error: `Role "${roleName}" not found.` };
        }

        const newUser = await prisma.users.create({
            data: {
                UserName: username,
                Email: email,
                PasswordHash: hashedPassword,
                CreatedAt: new Date(),
            },
        });

        await prisma.user_roles.create({
            data: {
                UserID: newUser.UserID,
                RoleID: role.RoleID,
            },
        });

        revalidatePath("/admin/team");
        return { success: true };
    } catch (error) {
        console.error("Error creating staff:", error);
        return { error: "Failed to create staff member. Please try again." };
    }
}
