"use server";

import { destroySession, getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logout() {
    await destroySession();
    redirect("/auth");
}

export async function updateUserProfile(formData: { username: string; email: string; basePath: string }) {
    try {
        const session = await getSession();
        if (!session) return { error: "Unauthorized" };

        await prisma.users.update({
            where: { UserID: session.userId },
            data: {
                UserName: formData.username,
                Email: formData.email,
            },
        });

        revalidatePath(`${formData.basePath}/profile`);
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile. Username or Email might already be taken." };
    }
}
