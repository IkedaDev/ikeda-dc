import express, { Express } from 'express';
import { WebhookController } from './controllers/webhook.controller';
import { ILogger } from '../../domain/ports/logger.interface';

export class ExpressServer {
  private app: Express;

  constructor(
    private webhookController: WebhookController,
    private logger: ILogger
  ) {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.post('/webhooks/:appId', this.webhookController.handleWebhook);
    
    // Endpoint de verificación de estado
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date() });
    });
  }

  start(): void {
    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      this.logger.info(`🌐 Servidor HTTP escuchando en el puerto ${port}`);
    });
  }
}
