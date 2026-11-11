import { LoginView } from "@/features/auth";
import { ownerExists } from "@/shared/api/studio/authActions";

export default async function Page() {
  const exists = await ownerExists();
  return <LoginView canRegister={!exists} />;
}
