import "dotenv/config";

import { Client, Events, GatewayIntentBits } from "discord.js";
import { asValue } from "awilix";
import { container, getRegisteredEvents } from "./container";

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

// Registrar la instancia de client en el contenedor de dependencias
container.register({
  discordClient: asValue(client)
});

// Registrar y escuchar los eventos
for (const event of getRegisteredEvents()) {
  if (event.once) {
    client.once(event.name as any, (...args: any[]) => event.execute(...args));
  } else {
    client.on(event.name as any, (...args: any[]) => event.execute(...args));
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🚀 Bot listo y escuchando como: ${readyClient.user.tag}`);
});

// Arrancar el servidor Express para recibir Webhooks
const expressServer = container.resolve('expressServer');
expressServer.start();

client.login(process.env.DISCORD_TOKEN);