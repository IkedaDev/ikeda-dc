// src/domain/ports/riot-service.interface.ts

export interface RankedInfo {
  tier: string;      // ej. "DIAMOND", "GOLD"
  rank: string;      // ej. "I", "II"
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface SummonerProfileDto {
  puuid: string;
  summonerId: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  soloDuoRank: RankedInfo | null;
  flexRank: RankedInfo | null;
}

export interface MatchDetailDto {
  matchId: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  kda: number;
}

export interface MatchAnalysisDto {
  recentMatches: MatchDetailDto[];
  winStreak: number;
  isHotStreak: boolean; // true si winStreak >= 3
  avgKda: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface LiveGameParticipantDto {
  puuid: string;
  summonerId: string;
  gameName: string;
  tagLine: string;
  championId: number;
  championName: string;
  teamId: number; // 100 para azul, 200 para rojo
  rankTier: string; // ej. "DIAMOND", "UNRANKED"
  rankDivision: string; // ej. "I", ""
  rankLp: number;
}

export interface LiveGameDto {
  gameId: string;
  gameMode: string;
  gameLength: number; // En segundos
  participants: LiveGameParticipantDto[];
}

// ---- Errores Específicos del Dominio ----

export class RiotApiError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'RiotApiError';
  }
}

export class RiotNotFoundError extends RiotApiError {
  constructor(message: string = 'Invocador o recurso no encontrado en Riot Games.') {
    super(404, message);
    this.name = 'RiotNotFoundError';
  }
}

export class RiotRateLimitError extends RiotApiError {
  constructor(message: string = 'Límite de peticiones de Riot superado. Por favor, intenta de nuevo más tarde.') {
    super(429, message);
    this.name = 'RiotRateLimitError';
  }
}

export class RiotForbiddenError extends RiotApiError {
  constructor(message: string = 'La clave de API de Riot no es válida o ha expirado.') {
    super(403, message);
    this.name = 'RiotForbiddenError';
  }
}

export interface IRiotService {
  /**
   * Obtiene la cuenta por Riot ID + Tagline (account-v1), luego recupera datos
   * de summoner (summoner-v4) y finalmente sus ligas (league-v4).
   * 
   * @param gameName Nombre en juego (ej. "hide on bush")
   * @param tagLine Tagline en juego (ej. "KR1")
   * @param platform Región del servidor (ej. "la1", "kr", "euw1")
   */
  getSummonerProfile(gameName: string, tagLine: string, platform: string): Promise<SummonerProfileDto>;

  /**
   * Obtiene las últimas 5 partidas recientes del jugador (match-v5),
   * calcula si el jugador está en racha de victorias (3+ seguidas) y
   * obtiene estadísticas promedio como KDA.
   */
  analyzeRecentMatches(puuid: string, platform: string): Promise<MatchAnalysisDto>;

  /**
   * Obtiene los datos de la partida en vivo del jugador (spectator-v5) y
   * retorna los nombres, campeones y rangos de los 10 jugadores.
   */
  getLiveGame(puuid: string, platform: string): Promise<LiveGameDto>;
}
