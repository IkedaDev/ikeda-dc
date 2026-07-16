// src/infrastructure/discord/commands/perfil.command.ts

import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  MessageFlags 
} from 'discord.js';
import { Command } from '../interfaces/command';
import { GetSummonerProfileUseCase } from '../../../application/use-cases/get-summoner-profile.use-case';
import { GetLiveGameUseCase } from '../../../application/use-cases/get-live-game.use-case';
import { 
  RiotNotFoundError, 
  RiotForbiddenError, 
  RiotRateLimitError, 
  RankedInfo 
} from '../../../domain/ports/riot-service.interface';

export class PerfilCommand implements Command {
  // Definición del comando de barra diagonal (Slash Command)
  public data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Muestra el perfil, estadísticas de liga y partida en vivo de un invocador de League of Legends.')
    .addStringOption(option => 
      option.setName('riot_id')
        .setDescription('Nombre de invocador en juego (sin el tagline, ej. hide on bush)')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('tagline')
        .setDescription('Etiqueta o Tag de Riot (ej. KR1, LAN, LAS)')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('region')
        .setDescription('Región del servidor de juego (por defecto LAN - la1)')
        .setRequired(false)
        .addChoices(
          { name: 'LAN (la1)', value: 'la1' },
          { name: 'LAS (la2)', value: 'la2' },
          { name: 'NA (na1)', value: 'na1' },
          { name: 'EUW (euw1)', value: 'euw1' },
          { name: 'EUNE (eun1)', value: 'eun1' },
          { name: 'KR (kr)', value: 'kr' },
          { name: 'BR (br1)', value: 'br1' }
        )
    ) as any;

  constructor(
    private readonly getSummonerProfile: GetSummonerProfileUseCase,
    private readonly getLiveGame: GetLiveGameUseCase
  ) {}

  /**
   * Ejecuta la lógica del comando /perfil de Discord.
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    if ( !['1527039732721127574','1525595909994315957'].includes(interaction.channelId) ) {
      await interaction.reply({
        content: '❌ Este comando solo se puede usar en el canal <#1527039732721127574>.',
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const riotId = interaction.options.getString('riot_id', true);
    const tagline = interaction.options.getString('tagline', true);
    const region = interaction.options.getString('region') || 'la2';

    // Hacer deferReply ya que las consultas a Riot toman más de 3 segundos
    await interaction.deferReply();

    try {
      // 1. Obtener perfil básico y análisis de partidas
      const { profile, analysis } = await this.getSummonerProfile.execute(riotId, tagline, region);

      // 2. Intentar buscar si está en partida activa en vivo
      let liveGameData = null;
      try {
        liveGameData = await this.getLiveGame.execute(profile.puuid, region);
      } catch (spectatorError) {
        // Ignoramos el error 404 de spectator ya que simplemente significa que no está en partida
        if (!(spectatorError instanceof RiotNotFoundError)) {
          console.error('Error al consultar partida activa:', spectatorError);
        }
      }

      // 3. Obtener color dinámico según el rango de Solo/Duo
      const colorEmbed = this.getRankColor(profile.soloDuoRank);

      // 4. Construir Embed del perfil
      const profileEmbed = new EmbedBuilder()
        .setColor(colorEmbed)
        .setTitle(`👤 Perfil de LoL: ${profile.gameName}#${profile.tagLine}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${profile.profileIconId}.png`)
        .addFields(
          { name: 'Nivel', value: `✨ Nivel ${profile.summonerLevel}`, inline: true },
          { name: 'Servidor', value: `🌐 ${region.toUpperCase()}`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true }, // Campo en blanco para alineación
          
          { 
            name: '🏆 Clasificatoria Solo/Duo', 
            value: this.formatRankString(profile.soloDuoRank), 
            inline: true 
          },
          { 
            name: '👥 Clasificatoria Flex', 
            value: this.formatRankString(profile.flexRank), 
            inline: true 
          },
          { name: '\u200B', value: '\u200B', inline: true }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Estadísticas de League of Legends`, 
          iconURL: interaction.guild?.iconURL() || undefined 
        });

      // 5. Agregar análisis de partidas recientes
      if (analysis.recentMatches.length > 0) {
        const winrate = Math.round((analysis.recentMatches.filter(m => m.win).length / analysis.recentMatches.length) * 100);
        const winsCount = analysis.recentMatches.filter(m => m.win).length;
        const lossesCount = analysis.recentMatches.length - winsCount;

        const kdaString = `⚡ KDA Promedio: **${analysis.avgKda.toFixed(2)}** (${analysis.kills.toFixed(1)} / ${analysis.deaths.toFixed(1)} / ${analysis.assists.toFixed(1)})`;
        const winrateString = `📈 Winrate reciente (5 partidas): **${winrate}%** (${winsCount}W - ${lossesCount}L)`;
        
        let badges = '';
        if (analysis.isHotStreak) {
          badges += `🔥 **¡En Racha de Victorias!** (${analysis.winStreak} consecutivas)\n`;
        }
        if (analysis.avgKda > 3.0) {
          badges += `⭐ **KDA Destacado** (>3.0 en promedio)\n`;
        }

        const champsUsed = Array.from(new Set(analysis.recentMatches.map(m => m.championName))).join(', ');
        const champsString = `🎮 Campeones recientes: *${champsUsed}*`;

        profileEmbed.addFields({
          name: '📊 Análisis de las últimas 5 partidas',
          value: `${badges}${kdaString}\n${winrateString}\n${champsString}`,
          inline: false
        });
      } else {
        profileEmbed.addFields({
          name: '📊 Análisis de las últimas 5 partidas',
          value: '❌ No se encontraron partidas recientes en el historial.',
          inline: false
        });
      }

      const embedsToSend = [profileEmbed];
      // 6. Si está en partida activa, construir Embed de la partida activa
      if (liveGameData) {
        const blueTeam = liveGameData.participants.filter(p => p.teamId === 100);
        const redTeam = liveGameData.participants.filter(p => p.teamId === 200);

        const formatTeamList = (team: typeof blueTeam) => {
          return team.map(p => {
            const rankStr = p.rankTier !== 'UNRANKED' 
              // ? `[${p.rankTier.substring(0, 3)} ${p.rankDivision}]`
              ? `[${p.rankTier} ${p.rankDivision}]`
              : '[Unranked]';
            // Formatear: Campeón - Nombre#Tag (Rango)
            const tagStr = p.tagLine ? `#${p.tagLine}` : '';
            return `🔹 **${p.championName}** - ${p.gameName}${tagStr} *${rankStr}*`;
          }).join('\n');
        };

        const liveEmbed = new EmbedBuilder()
          .setColor('#1abc9c')
          .setTitle(`🎮 ¡En Partida Activa! - Modo: ${liveGameData.gameMode}`)
          .setDescription(`Duración actual: **${Math.floor(liveGameData.gameLength / 60)} min**\n\n🔵 **Equipo Azul:**\n${formatTeamList(blueTeam)}\n\n🔴 **Equipo Rojo:**\n${formatTeamList(redTeam)}`)
          .setFooter({ text: 'Información del espectador en tiempo real' });

        embedsToSend.push(liveEmbed);
      }

      // Enviar respuesta
      await interaction.editReply({ embeds: embedsToSend });

    } catch (error) {
      // Manejo de errores específicos de Riot Games
      if (error instanceof RiotNotFoundError) {
        await interaction.editReply({ 
          content: `❌ No se encontró la cuenta de Riot **${riotId}#${tagline}** en la región **${region.toUpperCase()}**. Por favor verifica que el nombre y tagline estén bien escritos.` 
        });
      } else if (error instanceof RiotRateLimitError) {
        await interaction.editReply({ 
          content: '⚠️ La API de Riot Games está bajo demasiada carga (Rate Limit). Por favor, intenta de nuevo en unos minutos.' 
        });
      } else if (error instanceof RiotForbiddenError) {
        await interaction.editReply({ 
          content: '❌ Error de autenticación con Riot Games. Por favor, contacta al administrador del bot para revisar la API Key.' 
        });
      } else {
        console.error('Error al ejecutar comando /perfil:', error);
        await interaction.editReply({ 
          content: `❌ Ocurrió un error inesperado al consultar los datos: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
    }
  }

  /**
   * Retorna una representación en texto limpia del rango clasificatorio del jugador.
   */
  private formatRankString(rankInfo: RankedInfo | null): string {
    if (!rankInfo) return '❌ Sin rango (Unranked)';
    const winrate = Math.round((rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100);
    return `🔹 **${rankInfo.tier} ${rankInfo.rank}**\n${rankInfo.leaguePoints} LP\n🏆 Winrate: ${winrate}% (${rankInfo.wins}W / ${rankInfo.losses}L)`;
  }

  /**
   * Mapea el rango Solo/Duo a un color Hex de Discord para el Embed.
   */
  private getRankColor(rankInfo: RankedInfo | null): number {
    if (!rankInfo) return 0x95a5a6; // Gris claro (Unranked)

    switch (rankInfo.tier.toUpperCase()) {
      case 'CHALLENGER':
        return 0xe74c3c; // Rojo brillante / Fuego
      case 'GRANDMASTER':
        return 0xc0392b; // Rojo oscuro
      case 'MASTER':
        return 0x9b59b6; // Morado
      case 'DIAMOND':
        return 0x3498db; // Azul brillante
      case 'EMERALD':
        return 0x2ecc71; // Verde esmeralda
      case 'PLATINUM':
        return 0x1abc9c; // Verde azulado / Turquesa
      case 'GOLD':
        return 0xf1c40f; // Dorado
      case 'SILVER':
        return 0x95a5a6; // Gris plata
      case 'BRONZE':
        return 0xe67e22; // Naranja bronce
      case 'IRON':
        return 0x34495e; // Gris oscuro
      default:
        return 0x95a5a6; // Gris claro
    }
  }
}
