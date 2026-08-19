"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyAdminPassword } from "@/lib/adminAuth";

export async function loginAction(_prevState: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!verifyAdminPassword(password)) {
    return "비밀번호가 올바르지 않습니다.";
  }

  await createAdminSession();
  redirect(from.startsWith("/admin") ? from : "/admin");
}
