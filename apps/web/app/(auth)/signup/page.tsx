import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
