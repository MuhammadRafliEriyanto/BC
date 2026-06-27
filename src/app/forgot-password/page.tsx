import { Metadata } from "next";
import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Lupa Password - Bina Cendekia",
  description: "Minta kode reset password untuk akun Bina Cendekia Anda.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
