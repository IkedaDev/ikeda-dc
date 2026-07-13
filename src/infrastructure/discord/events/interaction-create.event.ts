import { Events, Interaction, GuildMember, MessageFlags } from 'discord.js';
import { Event } from '../interfaces/event';
import { Command } from '../interfaces/command';

export class InteractionCreateEvent implements Event {
  public name = Events.InteractionCreate;

  // Mapeo exacto de tus nuevos roles.
  // IMPORTANTE: Recuerda reemplazar estos strings por los IDs reales de tu servidor
  private readonly partidasRoleMapping: Record<string, string> = {
    'rankeds':  '1524841271330345190',
    'normales': '1524841077193052251',
    'arams':    '1524972549782638683',
    'torneos':  '1524841327144079441'
  };

constructor(private commandsMap: Map<string, Command>) {}

  async execute(interaction: Interaction): Promise<void> {
    // --- ESTRATEGIA A: BOTONES DE ROLES PREFERIDOS ---
    if (interaction.isButton()) {
      await this.handleButtonInteraction(interaction);
      return;
    }

    // --- ESTRATEGIA B: SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
      await this.handleChatInputCommand(interaction);
      return;
    }
  }

  /**
   * Manejador aislado para la asignación/remoción de roles mediante botones
   */
  private async handleButtonInteraction(interaction: any): Promise<void> {
    const { customId, member, guild } = interaction;
    if (!customId.startsWith('role_pref:')) return;

    // Diferimos la respuesta en la primera línea del flujo interno del evento 🚀
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildMember = member as GuildMember;
    const parts = customId.split(':');
    const seccion = parts[1];
    const roleKey = parts[2];

    let roleId: string | undefined;
    if (seccion === 'partidas') {
      roleId = this.partidasRoleMapping[roleKey];
    }

    if (!roleId) {
      await interaction.editReply({ content: '❌ Configuración de rol no encontrada en la base de infraestructura.' });
      return;
    }

    try {
      if (!guild?.members.me?.permissions.has('ManageRoles')) {
        await interaction.editReply({ content: '❌ El bot requiere el permiso administrativo "Gestionar Roles".' });
        return;
      }

      const role = guild.roles.cache.get(roleId);
      if (!role) {
        await interaction.editReply({ content: '❌ El rol no se encuentra configurado en los ajustes de Discord.' });
        return;
      }

      if (guildMember.roles.cache.has(roleId)) {
        await guildMember.roles.remove(roleId);
        await interaction.editReply({ content: `✅ Se ha retirado tu rol de **${role.name}** correctamente.` });
      } else {
        await guildMember.roles.add(roleId);
        await interaction.editReply({ content: `✅ ¡Asignado con éxito! Ahora tienes acceso a **${role.name}**.` });
      }
    } catch (error) {
      console.error(`[InteractionCreateEvent] Error en el sistema de roles:`, error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: '❌ Hubo un error de comunicación interna al modificar tus roles.' });
      }
    }
  }

  /**
   * Manejador aislado para ejecutar los comandos del Chat (/ping, /setup-roles, etc.)
   */
  private async handleChatInputCommand(interaction: any): Promise<void> {
    const command = this.commandsMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error ejecutando el comando /${interaction.commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
      }
    }
  }
}