import ForgotPasswordForm from "@/components/auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Fydaa",
  description: "Forgot Password",
};

export default function SignIn() {
  return <ForgotPasswordForm />;
}
