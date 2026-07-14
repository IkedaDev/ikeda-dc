import "dotenv/config"

import { REST, Routes } from "discord.js";
import { container, getRegisteredCommands } from "../../container";
import { asValue } from "awilix";

// Registrar un cliente Discord vacío ficticio para resolver dependencias en tiempo de despliegue
container.register({
  discordClient: asValue({} as any)
});

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('❌ Faltan variables de entorno en el .env');
  process.exit(1);
}

const commands = getRegisteredCommands();
const commandsJson = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`⏳ Iniciando la actualización de ${commandsJson.length} comandos de barra (/) en el servidor...`);

    // Registra los comandos directamente en tu servidor de pruebas (Guild) para que aparezcan instantáneamente
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commandsJson },
    );

    console.log('✅ ¡Comandos registrados con éxito en el servidor de pruebas!');
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
})();