"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  const signOut = async () => {
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        console.error("[SignOutButton] Sign-out failed:", result.error);
        setError("Não foi possível sair.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("[SignOutButton] Sign-out failed:", e);
      setError("Não foi possível sair.");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {error && <span role="alert" className="text-xs text-accent-marsala">{error}</span>}
      <button
        type="button"
        onClick={signOut}
        aria-label="Sair da conta"
        title="Sair da conta"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
