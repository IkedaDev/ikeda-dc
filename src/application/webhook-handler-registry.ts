import { IWebhookHandler } from '../domain/ports/webhook-handler.interface';

export class WebhookHandlerRegistry {
  private handlers = new Map<string, IWebhookHandler>();

  constructor(handlers: IWebhookHandler[]) {
    for (const handler of handlers) {
      this.handlers.set(handler.appId, handler);
    }
  }

  getHandler(appId: string): IWebhookHandler | undefined {
    return this.handlers.get(appId);
  }
}
