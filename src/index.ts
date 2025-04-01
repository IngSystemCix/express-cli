#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { generateProject } from "./generator";
import chalk from "chalk";
import { SingleBar } from "cli-progress"; // Importamos SingleBar de cli-progress
import { execa } from "execa"; // Necesitamos execa para ejecutar comandos como bun

const program = new Command();

// Banner
const banner = `
 /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\ 
( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )
 > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ < 
 /\\_/\\                                                                        /\\_/\\ 
( o.o )   _____                                                              ( o.o )
 > ^ <   | ______  ___ __  _ __ ___ ___ ___                                   > ^ < 
 /\\_/\\   |  _| \\ \\/ | '_ \\| '__/ _ / __/ __|                                  /\\_/\\ 
( o.o )  | |___ >  <| |_) | | |  __\\__ \\__ \\                                 ( o.o )
 > ^ <   |_____/_/\\_| .__/|_|  \\___|___|___/                                  > ^ < 
 /\\_/\\     ____     |_|                   _                ____ _     ___     /\\_/\\ 
( o.o )   / ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __   / ___| |   |_ _|   ( o.o )
 > ^ <   | |  _ / _ | '_ \\ / _ | '__/ _\` | __/ _ \\| '__| | |   | |    | |     > ^ < 
 /\\_/\\   | |_| |  __| | | |  __| | | (_| | || (_) | |    | |___| |___ | |     /\\_/\\ 
( o.o )   \\____|\\___|_| |_|\___||_|  \\__,_|\\__\\___/|_|     \\____|_____|___|   ( o.o )
 > ^ <                                                                        > ^ < 
 /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\  /\\_/\\ 
( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )( o.o )
 > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ <  > ^ < 
`;

program
  .command("generate")
  .alias("g")
  .name("express-generator")
  .version("1.0.0")
  .description("CLI para generar un proyecto Express")
  .action(async () => {
    // Mostrar el banner
    console.log(chalk.green(banner));

    // Bienvenida
    console.log(chalk.blue("¡Bienvenido a Express Generator CLI! @v1.0.0 @IngSystemCix"));

    // Preguntar el nombre del proyecto
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "¿Cómo deseas llamar a tu proyecto?",
        default: "my-express-app",
      },
    ]);

    // Preguntar por el lenguaje (JavaScript o TypeScript)
    const { language } = await inquirer.prompt([
      {
        type: "list",
        name: "language",
        message: "¿Qué lenguaje deseas usar?",
        choices: ["JavaScript", "TypeScript"],
      },
    ]);

    // Confirmación antes de crear el proyecto
    const { confirmCreate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmCreate",
        message: `¿Estás seguro de que deseas crear el proyecto "${projectName}" con ${language}?`,
        default: true,
      },
    ]);

    // Si el usuario confirma, generamos el proyecto
    if (confirmCreate) {
      try {
        console.log(chalk.green(`🚀 Creando el proyecto "${projectName}"...`));

        // Crear y configurar el progress bar
        const progressBar = new SingleBar({
          format: '{bar} {percentage}% | {value}/{total} archivos',
          barCompleteChar: '\u2588',
          barIncompleteChar: '\u2591',
        });

        // Establecer el total de pasos (en este caso 3, uno por cada fase importante)
        progressBar.start(3, 0);

        // Paso 1: Generar el proyecto
        await generateProject({ language, projectName });
        progressBar.update(1); // Actualizar el progreso

        // Paso 2: Instalar dependencias
        console.log(chalk.yellow('Instalando dependencias...'));
        
        // Usamos execa para correr el comando 'bun init' y esperamos a que termine
        const { stdout, stderr } = await execa("bun", ["init"], {
          cwd: projectName,
          stdio: "inherit",
        });
        
        if (stderr) {
          console.log(chalk.red("❌ Error al inicializar el proyecto."));
          console.error(stderr);
          return;
        }

        console.log(stdout); // Mostrar la salida del comando
        progressBar.update(2); // Actualizar el progreso después de la inicialización

        // Paso 3: Finalización
        console.log(chalk.green('Configuración completa.'));
        progressBar.update(3); // Última actualización
        progressBar.stop(); // Detener el progress bar

        console.log(chalk.blue(`✅ Proyecto "${projectName}" generado con éxito.`));
      } catch (err) {
        console.log(chalk.red("❌ Ocurrió un error al generar el proyecto."));
        console.error(err);
      }
    } else {
      console.log(chalk.yellow("🛑 Operación cancelada por el usuario."));
    }
  });

program.parse(process.argv);
