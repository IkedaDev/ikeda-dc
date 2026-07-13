import { WebhookHandlerRegistry } from '../webhook-handler-registry';
import { IDiscordNotifier } from '../../domain/ports/discord-notifier.interface';
import { IConfigRepository } from '../../domain/ports/config-repository.interface';
import { ILogger } from '../../domain/ports/logger.interface';

export class ProcessWebhookUseCase {
  constructor(
    private webhookHandlerRegistry: WebhookHandlerRegistry,
    private discordNotifier: IDiscordNotifier,
    private configRepository: IConfigRepository,
    private logger: ILogger
  ) {}

  async execute(appId: string, payload: any, headers: Record<string, string>): Promise<void> {
    this.logger.info(`Procesando webhook entrante para appId: ${appId}`);

    const config = this.configRepository.getWebhookConfig(appId);
    if (!config) {
      throw new Error(`No se encontró configuración de webhook para la app: ${appId}`);
    }

    let handler = this.webhookHandlerRegistry.getHandler(appId);
    if (!handler) {
      this.logger.warn(`No se encontró handler específico para "${appId}". Usando handler por defecto.`);
      handler = this.webhookHandlerRegistry.getHandler('default');
    }

    if (!handler) {
      throw new Error(`No se encontró handler (ni el por defecto) para la app: ${appId}`);
    }

    const messageOptions = await handler.handle(payload, headers);

    if (config.webhookUrl) {
      this.logger.info(`Enviando mensaje de webhook para "${appId}" vía webhook de Discord.`);
      await this.discordNotifier.sendToWebhook(config.webhookUrl, messageOptions);
    } else if (config.channelId) {
      this.logger.info(`Enviando mensaje de webhook para "${appId}" al canal de Discord: ${config.channelId}`);
      await this.discordNotifier.sendToChannel(config.channelId, messageOptions);
    } else {
      throw new Error(`La configuración de "${appId}" no tiene channelId ni webhookUrl.`);
    }
  }
}
