import { IWebhookHandler } from '../../../domain/ports/webhook-handler.interface';
import { DiscordMessageOptions } from '../../../domain/ports/discord-notifier.interface';

export class DefaultWebhookHandler implements IWebhookHandler {
  readonly appId = 'default';

  async handle(payload: any, headers: Record<string, string>): Promise<DiscordMessageOptions> {
    const content = payload?.content || payload?.message || (payload ? `\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`` : 'Webhook vacío');
    const embeds = payload?.embeds || [];

    return {
      embeds: [
        {
          title: `🔔 Evento GitHub: `,
          description: `Se recibió una notificación de GitHub del tipo.`,
          color: 0x24292f, // GitHub Dark Gray
          footer: {
            text: `GitHub Webhooks • ${payload?.repository?.name || 'Desconocido'}`,
          },
          timestamp: new Date().toISOString(),
        },
        {
            title: `🔌 Pull Request`,
            url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            description: `Description Test`,
            color: 0x24292f,
            author: {
              name: 'Ikeda',
              icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            },
            footer: {
              text: `GitHub Webhooks •`,
            },
            timestamp: new Date().toISOString(),
          },
      ],
      username: 'GitHub',
      avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    };
  
  }
}
