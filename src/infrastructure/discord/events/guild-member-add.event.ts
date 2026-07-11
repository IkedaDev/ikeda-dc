import { GuildMember, EmbedBuilder, Events, TextChannel, ColorResolvable } from 'discord.js';
import { GetWelcomeMessageUseCase } from '../../../application/use-cases/get-welcome-message';
import { Event } from '../interfaces/event';

export class GuildMemberAddEvent implements Event {
  public name = Events.GuildMemberAdd;

  constructor(private getWelcomeMessage: GetWelcomeMessageUseCase) {}

  async execute(member: GuildMember): Promise<void> {
    // 1. Buscamos el canal predeterminado del sistema del servidor (o uno por su nombre/ID)
    const channel = member.guild.systemChannel || 
                    member.guild.channels.cache.find(ch => ch.id === '1279220559787458694') as TextChannel;

    if (!channel) return;

    // 2. Ejecutamos la lógica de negocio para obtener la frase aleatoria
    const welcomeText = await this.getWelcomeMessage.execute(member.user.toString());

    // 3. Creamos un Embed profesional con una imagen descriptiva
    const welcomeEmbed = new EmbedBuilder()
      .setColor(welcomeText.color as ColorResolvable) // Color Blurple oficial de Discord
      .setTitle(welcomeText.title)
      .setDescription(welcomeText.title)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 })) // Foto de perfil del usuario
      // Puedes usar cualquier URL de imagen de bienvenida que desees aquí:
      .setImage(welcomeText.image) 
      // .setTimestamp()
      // .setFooter({ text: `Miembro #${member.guild.memberCount}` });

    // 4. Enviamos el mensaje al canal
    await channel.send({ embeds: [welcomeEmbed] });
  }
}