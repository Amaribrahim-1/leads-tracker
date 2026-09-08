import { getClaims } from "@/lib/supabase/getClaims";
import { redirect } from "next/navigation";

import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const claims = await getClaims();

  if (claims) {
    redirect("/");
  }

  return <LoginForm />;
}
