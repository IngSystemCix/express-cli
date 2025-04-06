#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { generateProject } from "./generator";
import chalk, { type ChalkInstance } from "chalk";
import boxen from "boxen";
import { SingleBar } from "cli-progress";
import { execa } from "execa";

const program = new Command();

// Función para crear etiquetas tipo Astro
const tag = (label: string, color: ChalkInstance) => chalk.bold.inverse(color(` ${label} `));

// Función para generar un color en arcoíris
const rainbowBar = (percent: number) => {
  const colors = [
    chalk.red,
    chalk.yellow,
    chalk.green,
    chalk.cyan,
    chalk.blue,
    chalk.magenta,
    chalk.white,
  ];
  return colors[Math.floor((percent / 100) * colors.length)](percent + "%");
};

// Banner con boxen
const bannerText = `CLI para generar un proyecto Express\n@v1.0.7 - @IngSystemCix`;
const banner = boxen(bannerText, {
  padding: 1,
  borderColor: "green",
  borderStyle: "round",
  title: "Express Generator",
  titleAlignment: "center",
});

program
  .command("generate")
  .alias("g")
  .name("express-generator")
  .version("1.0.0")
  .description("CLI para generar un proyecto Express")
  .action(async () => {
    // Mostrar el banner
    console.log(banner);

    // Bienvenida
    console.log(`${tag("info", chalk.blue)} Bienvenido a Express Generator CLI!`);

    // Preguntar el nombre del proyecto
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: `${tag("dir", chalk.magenta)} ¿Cómo deseas llamar a tu proyecto?`,
        default: "my-express-app",
      },
    ]);

    // Preguntar por el lenguaje (JavaScript o TypeScript)
    const { language } = await inquirer.prompt([
      {
        type: "list",
        name: "language",
        message: `${tag("lang", chalk.cyan)} ¿Qué lenguaje deseas usar?`,
        choices: ["JavaScript", "TypeScript"],
      },
    ]);

    // Confirmación antes de crear el proyecto
    const { confirmCreate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmCreate",
        message: `${tag("confirm", chalk.yellow)} ¿Crear el proyecto "${projectName}" con ${language}?`,
        default: true,
      },
    ]);

    if (confirmCreate) {
      // Preguntar si desea inicializar un repositorio Git
      const { initGit } = await inquirer.prompt([
        {
          type: "confirm",
          name: "initGit",
          message: `${tag("git", chalk.green)} ¿Deseas inicializar un repositorio Git?`,
          default: true,
        },
      ]);

      try {
        console.log(`${tag("Express", chalk.green)} 🚀 Creando el proyecto "${projectName}"...`);

        const progressBar = new SingleBar({
          format: `\n${chalk.green("{bar}")} ${chalk.yellow("{percentage}%")} | ${chalk.cyan("{value}/{total}")} pasos\n\n`,
          barCompleteChar: "\u2588",
          barIncompleteChar: "\u2591",
          fps: 60
        });

        progressBar.start(3, 0);

        await generateProject({ language, projectName });
        progressBar.update(1);

        console.log(`${tag("bun", chalk.yellow)} Instalando dependencias con bun...`);

        const { stdout, stderr } = await execa("bun", ["init", "-y"], {
          cwd: projectName,
          stdio: "inherit",
        });

        if (stderr) {
          console.log(`${tag("error", chalk.red)} Error al inicializar el proyecto.`);
          console.error(stderr);
          return;
        }

        console.log(stdout);
        progressBar.update(2);

        console.log(`${tag("done", chalk.green)} Configuración completa.`);
        progressBar.update(3);
        progressBar.stop();

        // Inicializar el repositorio Git si el usuario lo desea
        if (initGit) {
          console.log(`${tag("git", chalk.green)} Inicializando el repositorio Git...`);
          await execa("git", ["init"], { cwd: projectName, stdio: "inherit" });
          console.log(`${tag("git", chalk.green)} Repositorio Git inicializado.`);
        }

        console.log(`${tag("success", chalk.blue)} Proyecto "${projectName}" generado con éxito.`);
      } catch (err) {
        console.log(`${tag("error", chalk.red)} Ocurrió un error al generar el proyecto.`);
        console.error(err);
      }
    } else {
      console.log(`${tag("cancel", chalk.gray)} Operación cancelada por el usuario.`);
    }
  });

program.parse(process.argv);