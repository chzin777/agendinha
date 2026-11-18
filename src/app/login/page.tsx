"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, EyeOff, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.username({
        username: username.trim(),
        password,
      });
      if (result.error) {
        setError("Usuário ou senha inválidos. Confira seus dados e tente novamente.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (e) {
      console.error("[LoginPage] Sign-in failed:", e);
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#edf5ee] px-4 py-10">
      <div className="pointer-events-none absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#c9a84c]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-24 h-96 w-96 rounded-full bg-[#6d855a]/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/70 bg-card/90 shadow-[0_28px_90px_-35px_rgba(26,46,26,0.35)] backdrop-blur-xl md:grid-cols-[1fr_0.92fr]">
        <section className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#344b36] via-[#526d4d] to-[#82956a] p-10 text-white md:flex">
          <div className="absolute -right-16 top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-2 top-32 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
              <CalendarDays size={25} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Agendinha</p>
              <p className="text-xs text-white/70">Sua agenda acadêmica</p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Sparkles size={22} className="mb-5 text-[#e5ca78]" />
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Seu semestre,
              <br />
              em boas mãos.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
              Um espaço tranquilo para organizar aulas, entregas e ideias.
            </p>
          </div>

          <p className="relative text-xs text-white/55">Um passo de cada vez. Um dia de cada vez.</p>
        </section>

        <section className="flex min-h-[560px] flex-col justify-center px-6 py-10 sm:px-10 md:px-11">
          <div className="mb-9 md:hidden">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <CalendarDays size={24} />
            </span>
            <p className="text-sm font-semibold text-primary">AGENDINHA</p>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-gold">Bem-vinda de volta</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Entre na sua conta</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Acesse sua agenda e continue de onde parou.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-foreground">
                Usuário
              </label>
              <div className="relative">
                <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Seu nome de usuário"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                >
                  {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-accent-marsala/25 bg-accent-marsala/10 px-3.5 py-3 text-sm text-accent-marsala">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(67,89,57,0.65)] transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Acesso privado · Suas informações ficam protegidas
          </p>
        </section>
      </div>
    </main>
  );
}
