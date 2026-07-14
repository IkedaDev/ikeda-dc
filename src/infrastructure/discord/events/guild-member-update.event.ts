import { GuildMember, Events } from 'discord.js';
import { Event } from '../interfaces/event';
import { IConfigRepository } from '../../../domain/ports/config-repository.interface';
import { IRoleService } from '../../../domain/ports/role-service.interface';
import { ILogger } from '../../../domain/ports/logger.interface';

export class GuildMemberUpdateEvent implements Event {
  public name = Events.GuildMemberUpdate;

  constructor(
    private configRepository: IConfigRepository,
    private roleService: IRoleService,
    private logger: ILogger
  ) {}

  async execute(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // Si los roles no cambiaron, no hacemos nada
    if (oldRoles.equals(newRoles)) {
      return;
    }

    const guildId = newMember.guild.id;
    const memberId = newMember.id;
    const memberTag = newMember.user.tag;

    try {
      const mapping = this.configRepository.getPartidasRoleMapping();
      const extraRoleId = this.configRepository.getPartidasExtraRoleId();
      const partidasRoleIds = Object.values(mapping);

      const hasAnyPartidasRole = partidasRoleIds.some(roleId => newRoles.has(roleId));
      const hasExtraRole = newRoles.has(extraRoleId);

      if (hasAnyPartidasRole && !hasExtraRole) {
        this.logger.info(`GuildMemberUpdateEvent: Miembro ${memberTag} tiene roles de partidas pero no el rol extra (${extraRoleId}). Asignándolo.`);
        await this.roleService.assignRole(guildId, memberId, extraRoleId);
      } else if (!hasAnyPartidasRole && hasExtraRole) {
        this.logger.info(`GuildMemberUpdateEvent: Miembro ${memberTag} no tiene roles de partidas pero tiene el rol extra (${extraRoleId}). Removiéndolo.`);
        await this.roleService.removeRole(guildId, memberId, extraRoleId);
      }
    } catch (error) {
      this.logger.error(`Error en GuildMemberUpdateEvent al procesar roles para miembro ${memberTag}:`, error);
    }
  }
}
