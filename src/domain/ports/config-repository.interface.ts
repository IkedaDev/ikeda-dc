export interface WelcomeTemplateDto {
  title: string;
  template: string;
  color: string;
  image: string;
}

export interface WebhookAppConfig {
  appId: string;
  channelId?: string;
  webhookUrl?: string;
  secret?: string;
}

export interface SocialLinks {
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  web?: string;
}

export interface IConfigRepository {
  getWelcomeChannelId(): string;
  getDefaultRoleIds(): string[];
  getWelcomeTemplates(): WelcomeTemplateDto[];
  getPartidasRoleMapping(): Record<string, string>;
  getLineasRoleMapping(): Record<string, string>;
  getBotToken(): string;
  getClientId(): string;
  getGuildId(): string;
  getDeveloperUserIds(): string[];
  getWebhookConfig(appId: string): WebhookAppConfig | undefined;
  getSocialLinks(): SocialLinks;
  getPartidasExtraRoleId(): string;
}
