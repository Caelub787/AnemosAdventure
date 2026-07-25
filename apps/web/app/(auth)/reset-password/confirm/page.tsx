import type { Metadata } from "next";
import { ConfirmResetForm } from "./ConfirmResetForm";

export const metadata: Metadata = { title: "Set new password" };

export default function ConfirmResetPage() {
  return <ConfirmResetForm />;
}
