import { Client } from 'discord.js';
import { IRoleService } from '../../../domain/ports/role-service.interface';

export class DiscordRoleService implements IRoleService {
  // En Awilix inyectamos el cliente registrado como 'discordClient'
  constructor(private discordClient: Client) {}

  private async getMember(guildId: string, memberId: string) {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado.`);
    }
    const member = await guild.members.fetch(memberId);
    if (!member) {
      throw new Error(`Miembro con ID ${memberId} no encontrado en el servidor ${guildId}.`);
    }
    return member;
  }

  async assignRole(guildId: string, memberId: string, roleId: string): Promise<void> {
    const member = await this.getMember(guildId, memberId);
    await member.roles.add(roleId);
  }

  async removeRole(guildId: string, memberId: string, roleId: string): Promise<void> {
    const member = await this.getMember(guildId, memberId);
    await member.roles.remove(roleId);
  }

  async hasRole(guildId: string, memberId: string, roleId: string): Promise<boolean> {
    const member = await this.getMember(guildId, memberId);
    return member.roles.cache.has(roleId);
  }

  async getRoleName(guildId: string, roleId: string): Promise<string> {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado.`);
    }
    const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId);
    if (!role) {
      throw new Error(`Rol con ID ${roleId} no encontrado en el servidor ${guildId}.`);
    }
    return role.name;
  }
}
