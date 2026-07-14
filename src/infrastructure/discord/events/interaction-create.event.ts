import { Events, Interaction, MessageFlags } from 'discord.js';
import { Event } from '../interfaces/event';
import { Command } from '../interfaces/command';
import { ToggleMemberRolePreferenceUseCase } from '../../../application/use-cases/toggle-member-role-preference';

export class InteractionCreateEvent implements Event {
  public name = Events.InteractionCreate;

  constructor(
    private commandsMap: Map<string, Command>,
    private toggleMemberRolePreference: ToggleMemberRolePreferenceUseCase
  ) {}

  async execute(interaction: Interaction): Promise<void> {
    // --- BOTONES DE ROLES PREFERIDOS ---
    if (interaction.isButton()) {
      await this.handleButtonInteraction(interaction);
      return;
    }

    // --- SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
      await this.handleChatInputCommand(interaction);
      return;
    }
  }

  /**
   * Manejador para la asignación/remoción de roles mediante botones delegando en el Caso de Uso
   */
  private async handleButtonInteraction(interaction: any): Promise<void> {
    const { customId, member, guildId } = interaction;
    if (!customId.startsWith('role_pref:')) return;

    try {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const parts = customId.split(':');
      const seccion = parts[1];
      const roleKey = parts[2];
      const memberId = member?.id;

      if (!guildId || !memberId) {
        await interaction.editReply({ content: '❌ La interacción no es válida para este servidor o miembro.' });
        return;
      }

      const result = await this.toggleMemberRolePreference.execute(guildId, memberId, seccion, roleKey);

      if (result.action === 'added') {
        await interaction.editReply({ 
          content: `✅ ¡Asignado con éxito! Ahora tienes acceso a **${result.roleName}**.` 
        });
      } else {
        await interaction.editReply({ 
          content: `✅ Se ha retirado tu rol de **${result.roleName}** correctamente.` 
        });
      }
    } catch (error) {
      console.error('Error al manejar interacción de botón:', error);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ 
            content: `❌ ${error instanceof Error ? error.message : 'Hubo un error de comunicación interna al modificar tus roles.'}` 
          });
        }
      } catch (innerError) {
        console.error('No se pudo enviar respuesta de error de interacción:', innerError);
      }
    }
  }

  /**
   * Manejador para ejecutar los comandos del Chat (/ping, /setup-roles, etc.)
   */
  private async handleChatInputCommand(interaction: any): Promise<void> {
    const command = this.commandsMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);

      const errorMessage = 'Hubo un error al ejecutar este comando.';

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: errorMessage 
        });
      } else {
        
        await interaction.reply({ 
          content: errorMessage, 
          flags: [MessageFlags.Ephemeral] 
        });
      }
    }
  }
}