import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";

async function checkBun() {
  try {
    // Verifica si `bun` está disponible
    await execa("bun", ["--version"]);
    return true;
  } catch (err) {
    return false;
  }
}

export async function generateProject(answers: {
  language: string;
  projectName: string;
}) {
  const { language, projectName } = answers;
  const projectPath = path.join(process.cwd(), projectName);
  const useTS = language === "TypeScript";

  console.log(chalk.green(`🚀 Creando proyecto en: ${projectPath}`));

  // Crear el directorio
  fs.ensureDirSync(projectPath);

  // Verificar si `bun` está disponible
  const hasBun = await checkBun();
  if (!hasBun) {
    console.log(
      chalk.red(
        "❌ Bun no está instalado. Por favor, instala Bun para continuar."
      )
    );
    return;
  }

  // Inicializar `package.json` con `bun`
  await execa("bun", ["init", "-y"], { cwd: projectPath, stdio: "inherit" });

  // Instalar Express y dependencias con `bun`
  const deps = ["express", "cors", "dotenv"];
  const devDeps = useTS
    ? ["typescript", "ts-node", "@types/node", "@types/express", "nodemon"]
    : ["nodemon"];

  await execa("bun", ["add", ...deps], { cwd: projectPath, stdio: "inherit" });
  await execa("bun", ["add", "-d", ...devDeps], {
    cwd: projectPath,
    stdio: "inherit",
  });

  // Crear archivos base
  const indexFile = useTS ? "src/index.ts" : "src/index.js";
  fs.ensureDirSync(path.join(projectPath, "src"));

  let fileContent;

  if (useTS) {
    fileContent = 
    `import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
    `;
  } else {
    fileContent = 
    `import express from 'express';

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
    `;
  }

  fs.writeFileSync(path.join(projectPath, indexFile), fileContent);

  // Crear tsconfig.json si es TypeScript
  if (useTS) {
    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}`
    );
  }

  console.log(chalk.blue(`✅ Proyecto "${projectName}" generado con éxito.`));
}
