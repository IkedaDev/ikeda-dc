import { GuildMember, EmbedBuilder, Events, TextChannel, ColorResolvable } from 'discord.js';
import { GetWelcomeMessageUseCase } from '../../../application/use-cases/get-welcome-message';
import { Event } from '../interfaces/event';

export class GuildMemberAddEvent implements Event {
  public name = Events.GuildMemberAdd;

  constructor(private getWelcomeMessage: GetWelcomeMessageUseCase) {}

  async execute(member: GuildMember): Promise<void> {
    const channel = member.guild.systemChannel || 
                    member.guild.channels.cache.find(ch => ch.id === '1279220559787458694') as TextChannel;

    if (!channel) return;

    const welcomeText = await this.getWelcomeMessage.execute(member.user.toString());

    const welcomeEmbed = new EmbedBuilder()
      .setColor(welcomeText.color as ColorResolvable) 
      .setTitle(welcomeText.title)
      .setDescription(welcomeText.description)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 })) 
      .setImage(welcomeText.image) 
      // .setTimestamp()
      // .setFooter({ text: `Miembro #${member.guild.memberCount}` });

    await channel.send({ embeds: [welcomeEmbed] });
  }
}