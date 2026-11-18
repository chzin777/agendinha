import { createInterface } from "node:readline";

process.env.AUTH_BOOTSTRAP_MODE = "true";

function ask(prompt: string): Promise<string> {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

function askHidden(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Execute este comando em um terminal interativo para digitar a senha com segurança.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error?: Error) => {
      process.stdin.off("data", handleInput);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const handleInput = (chunk: Buffer) => {
      const input = chunk.toString("utf8");
      for (const character of input) {
        if (character === "\u0003") {
          finish(new Error("Operação cancelada."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    };

    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", handleInput);
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está configurada em .env.local.");
  }
  if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
    throw new Error("Configure BETTER_AUTH_SECRET em .env.local antes de criar a conta.");
  }

  const usernameInput = (await ask("Usuário [binha]: ")).trim() || "binha";
  const email = (await ask("E-mail da conta: ")).trim();
  const name = (await ask("Nome exibido [Agendinha]: ")).trim() || "Agendinha";
  if (!email) {
    throw new Error("Informe o e-mail da conta.");
  }
  const password = await askHidden("Nova senha (mínimo 12 caracteres; não será exibida): ");
  const confirmation = await askHidden("Confirme a nova senha: ");

  if (password.length < 12 || password.length > 128) {
    throw new Error("A senha deve ter entre 12 e 128 caracteres.");
  }
  if (password !== confirmation) {
    throw new Error("As senhas não conferem.");
  }

  const { auth, authPool } = await import("../src/lib/auth/server");
  try {
    const existingUsers = await authPool.query('SELECT 1 FROM "user" LIMIT 1');
    if (existingUsers.rowCount) {
      throw new Error("Já existe uma conta; o comando só cria a conta inicial.");
    }

    const result = await auth.api.signUpEmail({
      body: { email, name, password, username: usernameInput },
    });
    if (!result.user) {
      throw new Error("O serviço de autenticação não retornou o usuário criado.");
    }
    console.log(`Conta "${usernameInput}" criada. A senha foi armazenada com hash pelo Better Auth.`);
  } finally {
    await authPool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Não foi possível criar a conta.");
  process.exitCode = 1;
});
