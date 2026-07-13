import { GuildMember, Events } from 'discord.js';
import { Event } from '../interfaces/event';
import { HandleNewMemberUseCase } from '../../../application/use-cases/handle-new-member';

export class GuildMemberAddEvent implements Event {
  public name = Events.GuildMemberAdd;

  constructor(private handleNewMember: HandleNewMemberUseCase) {}

  async execute(member: GuildMember): Promise<void> {
    const guildId = member.guild.id;
    const memberId = member.id;
    const username = member.user.toString();
    const memberTag = member.user.tag;

    await this.handleNewMember.execute(guildId, memberId, username, memberTag);
  }
}