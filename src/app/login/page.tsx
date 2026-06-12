import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke portal LMS Bimbel untuk owner, admin, guru, dan siswa.",
};

export default function LoginPage() {
  return <LoginForm />;
}
