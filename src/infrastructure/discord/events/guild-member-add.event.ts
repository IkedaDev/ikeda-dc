import { GuildMember, EmbedBuilder, Events, TextChannel, ColorResolvable } from 'discord.js';
import { GetWelcomeMessageUseCase } from '../../../application/use-cases/get-welcome-message';
import { Event } from '../interfaces/event';

export class GuildMemberAddEvent implements Event {
  public name = Events.GuildMemberAdd;

  private readonly defaultRoleIds: string[] = [
    '1524839430454640900', 
  ];

  constructor(private getWelcomeMessage: GetWelcomeMessageUseCase) {}

  async execute(member: GuildMember): Promise<void> {
    await this.handleWelcomeMessage(member);
    await this.assignDefaultRoles(member);
  }

  private async handleWelcomeMessage(member: GuildMember): Promise<void> {
    const channel = member.guild.systemChannel || 
                    member.guild.channels.cache.find(ch => ch.id === '1279220559787458694') as TextChannel;

    if (!channel) return;

    const welcomeText = await this.getWelcomeMessage.execute(member.user.toString());

    const welcomeEmbed = new EmbedBuilder()
      .setColor(welcomeText.color as ColorResolvable) 
      .setTitle(welcomeText.title)
      .setDescription(welcomeText.description)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 })) 
      .setImage(welcomeText.image);

    await channel.send({ embeds: [welcomeEmbed] });
  }

  private async assignDefaultRoles(member: GuildMember): Promise<void> {
    if (this.defaultRoleIds.length === 0) return;

    try {
      if (!member.guild.members.me?.permissions.has('ManageRoles')) {
        console.warn('[GuildMemberAddEvent] El bot no tiene el permiso "ManageRoles" (Gestionar Roles).');
        return;
      }
      await member.roles.add(this.defaultRoleIds);
      console.log(`[GuildMemberAddEvent] Roles asignados con éxito a: ${member.user.tag}`);
    } catch (error) {
      console.error(`[GuildMemberAddEvent] Error al intentar asignar los roles a ${member.user.tag}:`, error);
    }
  }
}