"use server";

import { cookies } from "next/headers";

export async function createSession(user: { id: number; role: string }) {
  const cookieStore = await cookies();

  cookieStore.set(
    "session",
    JSON.stringify({
      userId: user.id,
      role: user.role,
    }),
    {
      httpOnly: true,
      path: "/",
    }
  );
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return session ? JSON.parse(session) : null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}



