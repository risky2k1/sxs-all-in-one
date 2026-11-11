"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerOwner } from "@/shared/api/studio/authActions";
import { createClient } from "@/shared/supabase/client";
import { t } from "@/locales/t";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function LoginView({ canRegister }: { canRegister: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function signIn() {
    setError("");
    const { error: authError } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function register() {
    setError("");
    try {
      await registerOwner(email, password);
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <Card className="w-full bg-secondary-background">
        <CardHeader>
          <CardTitle>
            {canRegister ? t("login.registerTitle") : t("login.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label>
            {t("login.email")}
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Label>
          <Label>
            {t("login.password")}
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Label>
          {error ? <p className="text-sm">{error}</p> : null}
          {canRegister ? <p className="text-sm">{t("login.hint")}</p> : null}
          <Button type="button" onClick={canRegister ? register : signIn}>
            {canRegister ? t("login.register") : t("login.submit")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
