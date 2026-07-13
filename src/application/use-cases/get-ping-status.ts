import { ILogger } from '../../domain/ports/logger.interface';

export class GetPingStatusUseCase {
  constructor(private logger: ILogger) {}

  async execute(): Promise<string> {
    this.logger.debug('GetPingStatusUseCase: ejecutando verificación de latencia.');
    return '¡Pong! 🏓 El sistema está operacional.';
  }
}