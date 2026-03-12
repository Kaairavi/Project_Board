// app/lib/auth.ts
"use server";

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createSession } from "@/app/lib/session";

export async function handleAuth(
  mode: "login" | "register",
  formData: FormData
) {
  try {
    if (mode === "login") {
      return await loginUser(formData);
    }
    return await registerUser(formData);
  } catch (error: any) {
    return { success: false, error: error.message || "An authentication error occurred" };
  }
}

export async function loginUser(formData: FormData) {
  const Email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.users.findUnique({
    where: { Email },
    include: { user_roles: { include: { roles: true } } },
  });

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.PasswordHash);

  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  const roleName = user.user_roles[0]?.roles?.RoleName || "Team_Member";

  await createSession({
    id: user.UserID,
    role: roleName,
  });

  return { success: true, role: roleName };
}

export async function registerUser(formData: FormData) {
  const UserName = formData.get("username") as string;
  const Email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.users.findUnique({ where: { Email } });
  if (existingUser) {
    return { success: false, error: "Email already exists" };
  }

  const user = await prisma.users.create({
    data: {
      UserName,
      Email,
      PasswordHash: hashedPassword,
    },
  });

  const userRole = await prisma.roles.findUnique({
    where: { RoleName: "Team_Member" },
  });

  if (!userRole) {
    return { success: false, error: "Default role not found" };
  }

  await prisma.user_roles.create({
    data: {
      UserID: user.UserID,
      RoleID: userRole.RoleID,
    },
  });

  await createSession({
    id: user.UserID,
    role: userRole.RoleName,
  });

  return { success: true, role: userRole.RoleName };
}
