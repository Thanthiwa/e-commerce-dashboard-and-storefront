import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "admin_session";

function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    await jwtVerify(token, getSecretKey());
    redirect("/admin/dashboard");
  } catch {
    redirect("/admin/login");
  }
}
