import { Request, Response } from 'express';
import { ProcessWebhookUseCase } from '../../../application/use-cases/process-webhook';
import { ILogger } from '../../../domain/ports/logger.interface';

export class WebhookController {
  constructor(
    private processWebhook: ProcessWebhookUseCase,
    private logger: ILogger
  ) {}

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const { appId } = req.params as any;
    const payload = req.body;
    const headers = req.headers as Record<string, string>;

    try {
      await this.processWebhook.execute(appId, payload, headers);
      res.status(200).json({ success: true, message: `Webhook procesado con éxito para: ${appId}` });
    } catch (error: any) {
      this.logger.error(`Error procesando webhook de ${appId}: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
