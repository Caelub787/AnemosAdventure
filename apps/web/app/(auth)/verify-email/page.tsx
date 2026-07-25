import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1 className="text-lg font-semibold text-white">Check your inbox</h1>
      <p className="text-sm text-slate-400">
        We sent a confirmation link to your email address. Click it to activate your account, then log in.
      </p>
    </div>
  );
}
