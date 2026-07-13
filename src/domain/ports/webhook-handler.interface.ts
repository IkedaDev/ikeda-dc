import { DiscordMessageOptions } from './discord-notifier.interface';

export interface IWebhookHandler {
  appId: string;
  handle(payload: any, headers: Record<string, string>): Promise<DiscordMessageOptions>;
}
