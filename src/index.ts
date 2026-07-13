import "dotenv/config";

import { Client, Events, GatewayIntentBits } from "discord.js";
import { getRegisteredEvents } from "./container";

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

client.login(process.env.DISCORD_TOKEN);