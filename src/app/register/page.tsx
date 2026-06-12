import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Daftar akun LMS Bimbel dan verifikasi email sebelum login.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
