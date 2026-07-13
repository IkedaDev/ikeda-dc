import { Client, EmbedBuilder, ColorResolvable, TextChannel } from 'discord.js';
import { IWelcomeNotifier } from '../../../domain/ports/welcome-notifier.interface';
import { WelcomeMessage } from '../../../domain/entities/welcome-message';

export class DiscordWelcomeNotifier implements IWelcomeNotifier {
  constructor(private discordClient: Client) {}

  async sendWelcome(guildId: string, channelId: string, memberId: string, message: WelcomeMessage): Promise<void> {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado para enviar la bienvenida.`);
    }

    // Buscar canal
    let channel = guild.channels.cache.get(channelId);
    if (!channel) {
      channel = await guild.channels.fetch(channelId) as any;
    }

    // Fallback al systemChannel si el canal configurado no existe
    const targetChannel = (channel || guild.systemChannel) as TextChannel;
    if (!targetChannel) {
      throw new Error(`No se pudo encontrar el canal de bienvenida ${channelId} ni el canal de sistema del servidor.`);
    }

    // Obtener miembro para el avatar
    const member = await guild.members.fetch(memberId);
    if (!member) {
      throw new Error(`Miembro con ID ${memberId} no encontrado para formatear la bienvenida.`);
    }

    // Construir embed
    const welcomeEmbed = new EmbedBuilder()
      .setColor(message.color as ColorResolvable)
      .setTitle(message.title)
      .setDescription(message.description)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }));

    if (message.image) {
      welcomeEmbed.setImage(message.image);
    }

    await targetChannel.send({ embeds: [welcomeEmbed] });
  }
}
