export interface WelcomeTemplateDto {
  title: string;
  template: string;
  color: string;
  image: string;
}

export interface IConfigRepository {
  getWelcomeChannelId(): string;
  getDefaultRoleIds(): string[];
  getWelcomeTemplates(): WelcomeTemplateDto[];
  getPartidasRoleMapping(): Record<string, string>;
  getBotToken(): string;
  getClientId(): string;
  getGuildId(): string;
}
