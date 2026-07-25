import { requireUser } from "@/lib/auth/getCurrentUser";
import { CreateContentItemForm } from "@/components/admin/CreateContentItemForm";

export default async function NewContentItemPage() {
  const { user } = await requireUser();
  return <CreateContentItemForm createdBy={user.id} />;
}
