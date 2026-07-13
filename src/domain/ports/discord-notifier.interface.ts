export interface DiscordMessageOptions {
  content?: string;
  embeds?: any[];
  username?: string;
  avatarUrl?: string;
}

export interface IDiscordNotifier {
  sendToChannel(channelId: string, options: DiscordMessageOptions): Promise<void>;
  sendToWebhook(webhookUrl: string, options: DiscordMessageOptions): Promise<void>;
}
