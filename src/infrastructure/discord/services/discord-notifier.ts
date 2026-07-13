import { Client, TextChannel, WebhookClient } from 'discord.js';
import { IDiscordNotifier, DiscordMessageOptions } from '../../../domain/ports/discord-notifier.interface';

export class DiscordNotifier implements IDiscordNotifier {
  constructor(private discordClient: Client) {}

  async sendToChannel(channelId: string, options: DiscordMessageOptions): Promise<void> {
    const channel = await this.discordClient.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error(`Canal de Discord no encontrado o no es de texto: ${channelId}`);
    }
    await channel.send({
      content: options.content,
      embeds: options.embeds,
    });
  }

  async sendToWebhook(webhookUrl: string, options: DiscordMessageOptions): Promise<void> {
    const webhookClient = new WebhookClient({ url: webhookUrl });
    await webhookClient.send({
      content: options.content,
      embeds: options.embeds,
      username: options.username,
      avatarURL: options.avatarUrl,
    });
  }
}
