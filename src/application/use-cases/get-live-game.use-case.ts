// src/application/use-cases/get-live-game.use-case.ts

import { IRiotService, LiveGameDto } from '../../domain/ports/riot-service.interface';
import { ILogger } from '../../domain/ports/logger.interface';

export class GetLiveGameUseCase {
  constructor(
    private readonly riotService: IRiotService,
    private readonly logger: ILogger
  ) {}

  /**
   * Obtiene la información en vivo de la partida activa del invocador.
   */
  async execute(puuid: string, platform: string): Promise<LiveGameDto> {
    this.logger.debug(`GetLiveGameUseCase: Consultando partida activa del PUUID ${puuid} en la plataforma ${platform}`);
    return await this.riotService.getLiveGame(puuid, platform);
  }
}
