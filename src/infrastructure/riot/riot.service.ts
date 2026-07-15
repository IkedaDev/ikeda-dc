// src/infrastructure/riot/riot.service.ts

import { 
  IRiotService, 
  SummonerProfileDto, 
  RankedInfo, 
  MatchAnalysisDto, 
  MatchDetailDto, 
  LiveGameDto, 
  LiveGameParticipantDto,
  RiotApiError,
  RiotNotFoundError,
  RiotForbiddenError,
  RiotRateLimitError
} from '../../domain/ports/riot-service.interface';
import { IConfigRepository } from '../../domain/ports/config-repository.interface';
import { ILogger } from '../../domain/ports/logger.interface';
import { LruCache } from './lru-cache';

export class RiotService implements IRiotService {
  // Cachés internas (in-memory) con límites de tamaño para evitar fugas de memoria
  private readonly profileCache = new LruCache<string, SummonerProfileDto>(3 * 60 * 1000, 500); // 3 minutos, max 500 perfiles
  private readonly liveGameCache = new LruCache<string, LiveGameDto>(1 * 60 * 1000, 100);       // 1 minuto, max 100 partidas activas
  
  // Caché interna para rangos individuales de jugadores, para acelerar la lógica del espectador
  private readonly rankCache = new LruCache<string, { soloDuo: RankedInfo | null; flex: RankedInfo | null }>(3 * 60 * 1000, 1000);

  // Mapeo dinámico de ID de campeón a nombre
  private championMap = new Map<string, string>();
  private isChampionMapLoaded = false;

  constructor(
    private readonly configRepository: IConfigRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Traduce la plataforma de juego (ej. la1, na1, euw1) a la región de ruteo global (Routing Region) de Riot API.
   * Utilizada por endpoints como account-v1 y match-v5.
   */
  private getGlobalRegion(platform: string): string {
    const p = platform.toLowerCase();
    if (['la1', 'la2', 'na1', 'br1'].includes(p)) return 'americas';
    if (['euw1', 'eun1', 'tr1', 'ru'].includes(p)) return 'europe';
    if (['kr', 'jp1'].includes(p)) return 'asia';
    if (['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'].includes(p)) return 'sea';
    return 'americas'; // Valor por defecto
  }

  /**
   * Realiza una llamada HTTP genérica a la API de Riot Games incluyendo la API Key y gestionando códigos de estado.
   */
  private async makeRequest<T>(url: string): Promise<T> {
    const apiKey = this.configRepository.getRiotApiKey();
    if (!apiKey) {
      this.logger.error('RiotService: RIOT_API_KEY no está configurada.');
      throw new RiotForbiddenError('La clave de API de Riot no está configurada en las variables de entorno.');
    }

    try {
      this.logger.debug(`RiotService: Realizando petición a ${url}`);
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': apiKey
        }
      });

      if (!response.ok) {
        this.logger.warn(`RiotService: Petición fallida a [${url}] - Status: ${response.status}`);
        if (response.status === 404) {
          throw new RiotNotFoundError();
        }
        if (response.status === 403) {
          throw new RiotForbiddenError();
        }
        if (response.status === 429) {
          throw new RiotRateLimitError();
        }
        throw new RiotApiError(response.status, `Error de la API de Riot: Código ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof RiotApiError) {
        throw error;
      }
      this.logger.error(`RiotService: Error de red al solicitar [${url}]:`, error);
      throw new RiotApiError(500, `Error de red al conectar con Riot Games: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Carga el diccionario de campeones desde Riot Data Dragon para traducir IDs numéricos a nombres.
   */
  private async ensureChampionMapLoaded(): Promise<void> {
    if (this.isChampionMapLoaded) return;

    try {
      this.logger.debug('RiotService: Cargando lista de campeones desde Data Dragon...');
      
      // 1. Obtener la última versión de parches disponible
      const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (!versionsResponse.ok) {
        throw new Error(`No se pudo obtener las versiones de DDragon: ${versionsResponse.status}`);
      }
      const versions = await versionsResponse.json() as string[];
      const latestVersion = versions[0] || '14.13.1';

      // 2. Descargar el archivo champion.json en español de esa versión
      const championResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/es_ES/champion.json`);
      if (!championResponse.ok) {
        throw new Error(`No se pudo obtener campeones de DDragon: ${championResponse.status}`);
      }

      const body = await championResponse.json() as { data: Record<string, { key: string; name: string }> };
      
      for (const key in body.data) {
        const champ = body.data[key];
        // champ.key es el ID en string (ej. "266"), champ.name es el nombre en español (ej. "Aatrox")
        this.championMap.set(champ.key, champ.name);
      }

      this.isChampionMapLoaded = true;
      this.logger.info(`RiotService: Se cargaron ${this.championMap.size} campeones correctamente.`);
    } catch (error) {
      this.logger.error('RiotService: Falló la carga del mapa de campeones de Data Dragon:', error);
      // No bloqueamos completamente el bot, pero loggeamos la falla
    }
  }

  /**
   * Obtiene el perfil de un invocador buscando su PUUID, sus datos de invocador y sus ligas de clasificatoria.
   */
  async getSummonerProfile(gameName: string, tagLine: string, platform: string): Promise<SummonerProfileDto> {
    const cleanGameName = gameName.trim();
    const cleanTagLine = tagLine.trim().toUpperCase();
    const cleanPlatform = platform.trim().toLowerCase();
    
    const cacheKey = `${cleanPlatform}:${cleanGameName.toLowerCase()}#${cleanTagLine}`;


    // 1. Verificar la caché de perfiles
    const cachedProfile = this.profileCache.get(cacheKey);
    if (cachedProfile) {
      this.logger.debug(`RiotService: Retornando perfil de la caché para ${cacheKey}`);
      return cachedProfile;
    }

    const globalRegion = this.getGlobalRegion(cleanPlatform);

    // 2. Obtener PUUID del account-v1
    const accountUrl = `https://${globalRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanGameName)}/${encodeURIComponent(cleanTagLine)}`;
    const accountData = await this.makeRequest<{ puuid: string; gameName: string; tagLine: string }>(accountUrl);

    // 3. Obtener summonerId y nivel del summoner-v4 (con ID opcional si no es devuelto por el entorno)
    const summonerUrl = `https://${cleanPlatform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    const summonerData = await this.makeRequest<{ id?: string; profileIconId: number; summonerLevel: number }>(summonerUrl);

    // 4. Obtener las clasificatorias del league-v4 usando el PUUID (más robusto y compatible)
    const leagueUrl = `https://${cleanPlatform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}`;
    const leagueData = await this.makeRequest<any[]>(leagueUrl);

    let soloDuoRank: RankedInfo | null = null;
    let flexRank: RankedInfo | null = null;

    for (const entry of leagueData) {
      const rankInfo: RankedInfo = {
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses
      };

      if (entry.queueType === 'RANKED_SOLO_5x5') {
        soloDuoRank = rankInfo;
      } else if (entry.queueType === 'RANKED_FLEX_SR') {
        flexRank = rankInfo;
      }
    }

    const summonerIdValue = summonerData.id || accountData.puuid;

    // 5. Guardar en la caché de rangos (usando PUUID como clave)
    this.rankCache.set(`${cleanPlatform}:${accountData.puuid}`, { soloDuo: soloDuoRank, flex: flexRank });

    const profile: SummonerProfileDto = {
      puuid: accountData.puuid,
      summonerId: summonerIdValue,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      soloDuoRank,
      flexRank
    };

    // 6. Almacenar en la caché de perfiles
    this.profileCache.set(cacheKey, profile);

    return profile;
  }

  /**
   * Analiza las últimas 5 partidas del jugador para calcular KDA promedio y racha de victorias.
   */
  async analyzeRecentMatches(puuid: string, platform: string): Promise<MatchAnalysisDto> {
    const globalRegion = this.getGlobalRegion(platform);

    // 1. Obtener la lista de los últimos 5 IDs de partida
    const matchIdsUrl = `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`;
    const matchIds = await this.makeRequest<string[]>(matchIdsUrl);

    if (matchIds.length === 0) {
      return {
        recentMatches: [],
        winStreak: 0,
        isHotStreak: false,
        avgKda: 0,
        kills: 0,
        deaths: 0,
        assists: 0
      };
    }

    await this.ensureChampionMapLoaded();

    // 2. Obtener los detalles de las 5 partidas en paralelo
    const matchPromises = matchIds.map(async (matchId) => {
      try {
        const matchUrl = `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const matchResponse = await this.makeRequest<{ info: { participants: any[] } }>(matchUrl);
        
        // Encontrar al participante correspondiente al puuid solicitado
        const participant = matchResponse.info.participants.find((p) => p.puuid === puuid);
        if (!participant) return null;

        const kills = participant.kills;
        const deaths = participant.deaths;
        const assists = participant.assists;
        const win = participant.win;
        const kda = (kills + assists) / Math.max(1, deaths);
        
        const championName = this.championMap.get(String(participant.championId)) || participant.championName || `Champ ${participant.championId}`;

        return {
          matchId,
          championName,
          kills,
          deaths,
          assists,
          win,
          kda
        } as MatchDetailDto;
      } catch (err) {
        this.logger.warn(`RiotService: Error al procesar partida ${matchId}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
      }
    });

    const results = await Promise.all(matchPromises);
    const validMatches = results.filter((m): m is MatchDetailDto => m !== null);

    if (validMatches.length === 0) {
      return {
        recentMatches: [],
        winStreak: 0,
        isHotStreak: false,
        avgKda: 0,
        kills: 0,
        deaths: 0,
        assists: 0
      };
    }

    // 3. Calcular estadísticas globales de las 5 partidas
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;

    for (const match of validMatches) {
      totalKills += match.kills;
      totalDeaths += match.deaths;
      totalAssists += match.assists;
    }

    const avgKda = (totalKills + totalAssists) / Math.max(1, totalDeaths);

    // 4. Racha de victorias consecutivas empezando desde la partida más reciente (índice 0)
    let winStreak = 0;
    for (const match of validMatches) {
      if (match.win) {
        winStreak++;
      } else {
        break; // Al primer loss, se corta la racha activa
      }
    }

    return {
      recentMatches: validMatches,
      winStreak,
      isHotStreak: winStreak >= 3,
      avgKda,
      kills: totalKills / validMatches.length,
      deaths: totalDeaths / validMatches.length,
      assists: totalAssists / validMatches.length
    };
  }

  /**
   * Obtiene la partida activa del invocador y recupera de manera controlada el rango de los 10 jugadores.
   */
  async getLiveGame(puuid: string, platform: string): Promise<LiveGameDto> {
    const cleanPlatform = platform.trim().toLowerCase();
    const cacheKey = `${cleanPlatform}:${puuid}`;

    // 1. Comprobar caché de partidas activas
    const cachedGame = this.liveGameCache.get(cacheKey);
    if (cachedGame) {
      this.logger.debug(`RiotService: Retornando partida activa de la caché para ${cacheKey}`);
      return cachedGame;
    }

    // 2. Consultar espectador activo
    const spectatorUrl = `https://${cleanPlatform}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    let rawGameData: any;
    
    try {
      rawGameData = await this.makeRequest<any>(spectatorUrl);
    } catch (error) {
      if (error instanceof RiotNotFoundError) {
        throw new RiotNotFoundError('El invocador no se encuentra en una partida activa en este momento.');
      }
      throw error;
    }

    await this.ensureChampionMapLoaded();

    // 3. Procesar los 10 participantes obteniendo sus rangos de manera resiliente
    const participants: any[] = rawGameData.participants || [];
    
    const mappedParticipants = await Promise.all(
      participants.map(async (p) => {
        let tier = 'UNRANKED';
        let division = '';
        let lp = 0;

        try {
          const participantPuuid = p.puuid;
          const cacheKeyRank = `${cleanPlatform}:${participantPuuid}`;
          
          // Primero buscar en la caché de rangos individuales usando PUUID
          const cachedRanks = this.rankCache.get(cacheKeyRank);
          
          if (cachedRanks) {
            if (cachedRanks.soloDuo) {
              tier = cachedRanks.soloDuo.tier;
              division = cachedRanks.soloDuo.rank;
              lp = cachedRanks.soloDuo.leaguePoints;
            }
          } else {
            // Si no está en caché, hacer petición league-v4 a Riot por PUUID
            const leagueUrl = `https://${cleanPlatform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${participantPuuid}`;
            const leagueData = await this.makeRequest<any[]>(leagueUrl);

            let soloDuo: RankedInfo | null = null;
            let flex: RankedInfo | null = null;

            for (const entry of leagueData) {
              const rankInfo: RankedInfo = {
                tier: entry.tier,
                rank: entry.rank,
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses
              };

              if (entry.queueType === 'RANKED_SOLO_5x5') {
                soloDuo = rankInfo;
              } else if (entry.queueType === 'RANKED_FLEX_SR') {
                flex = rankInfo;
              }
            }

            // Guardar en la caché de rangos
            this.rankCache.set(cacheKeyRank, { soloDuo, flex });

            if (soloDuo) {
              tier = soloDuo.tier;
              division = soloDuo.rank;
              lp = soloDuo.leaguePoints;
            }
          }
        } catch (err) {
          // Si falla (ej. rate limit individual), continuamos y dejamos al jugador como UNRANKED
          this.logger.warn(`RiotService: Falló la obtención de rango para summonerId ${p.summonerId} en partida en vivo. Detalle: ${err instanceof Error ? err.message : String(err)}`);
        }

        const championName = this.championMap.get(String(p.championId)) || `Campeón ${p.championId}`;

        // Obtener Riot ID (gameName y tagline) en spectator-v5 si están presentes
        const gameName = p.riotIdGameName || p.summonerName || 'Invocador';
        const tagLine = p.riotIdTagline || '';

        return {
          puuid: p.puuid,
          summonerId: p.summonerId,
          gameName,
          tagLine,
          championId: p.championId,
          championName,
          teamId: p.teamId,
          rankTier: tier,
          rankDivision: division,
          rankLp: lp
        } as LiveGameParticipantDto;
      })
    );

    const liveGame: LiveGameDto = {
      gameId: String(rawGameData.gameId),
      gameMode: rawGameData.gameMode,
      gameLength: rawGameData.gameLength,
      participants: mappedParticipants
    };

    // 4. Guardar en la caché de partidas activas
    this.liveGameCache.set(cacheKey, liveGame);

    return liveGame;
  }
}
