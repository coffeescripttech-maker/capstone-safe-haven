import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - SafeHaven Admin Dashboard",
  description: "Sign in to access the SafeHaven disaster management admin dashboard"
};

export default function SignIn() {
  return <SignInForm />;
}
