import "dotenv/config"

import { Client, Events, GatewayIntentBits, Interaction } from "discord.js";
import { container, getRegisteredCommands } from "./container";
import { GuildMemberAddEvent } from "./infrastructure/discord/events/guild-member-add.event";

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ Error: DISCORD_TOKEN no definido.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const welcomeEvent = new GuildMemberAddEvent(container.resolve('getWelcomeMessage'));
client.on(welcomeEvent.name as any, (member) => welcomeEvent.execute(member));

// Obtenemos los comandos listos desde nuestra arquitectura limpia
const commands = getRegisteredCommands();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🚀 Bot listo y escuchando como: ${readyClient.user.tag}`);
});

// Manejador central de interacciones
client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error ejecutando el comando /${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);