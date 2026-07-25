import type { Metadata } from "next";
import { RequestResetForm } from "./RequestResetForm";

export const metadata: Metadata = { title: "Reset password" };

export default function RequestResetPage() {
  return <RequestResetForm />;
}
