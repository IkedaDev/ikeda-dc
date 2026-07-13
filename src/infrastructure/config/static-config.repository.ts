import { IConfigRepository, WelcomeTemplateDto, WebhookAppConfig } from '../../domain/ports/config-repository.interface';
import { botConfig } from './bot-config';

export class StaticConfigRepository implements IConfigRepository {
  getWelcomeChannelId(): string {
    return botConfig.welcomeChannelId;
  }

  getDefaultRoleIds(): string[] {
    return botConfig.defaultRoleIds;
  }

  getWelcomeTemplates(): WelcomeTemplateDto[] {
    return botConfig.welcomeTemplates;
  }

  getPartidasRoleMapping(): Record<string, string> {
    return botConfig.partidasRoleMapping;
  }

  getBotToken(): string {
    return botConfig.discordToken;
  }

  getClientId(): string {
    return botConfig.clientId;
  }

  getGuildId(): string {
    return botConfig.guildId;
  }

  getDeveloperUserIds(): string[] {
    return botConfig.developerUserIds;
  }

  getWebhookConfig(appId: string): WebhookAppConfig | undefined {
    return botConfig.webhooks.find(w => w.appId === appId);
  }
}
