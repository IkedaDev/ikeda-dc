// src/application/use-cases/get-summoner-profile.use-case.ts

import { IRiotService, SummonerProfileDto, MatchAnalysisDto } from '../../domain/ports/riot-service.interface';
import { ILogger } from '../../domain/ports/logger.interface';

export interface SummonerProfileResponse {
  profile: SummonerProfileDto;
  analysis: MatchAnalysisDto;
}

export class GetSummonerProfileUseCase {
  constructor(
    private readonly riotService: IRiotService,
    private readonly logger: ILogger
  ) {}

  /**
   * Ejecuta la lógica coordinada para obtener el perfil del jugador y el análisis de sus últimas partidas.
   */
  async execute(gameName: string, tagLine: string, platform: string): Promise<SummonerProfileResponse> {
    this.logger.debug(`GetSummonerProfileUseCase: Consultando perfil de ${gameName}#${tagLine} en ${platform}`);
    
    // 1. Obtener perfil básico y clasificación de ligas
    const profile = await this.riotService.getSummonerProfile(gameName, tagLine, platform);
    
    // 2. Analizar las últimas 5 partidas recientes
    const analysis = await this.riotService.analyzeRecentMatches(profile.puuid, platform);

    return {
      profile,
      analysis
    };
  }
}
