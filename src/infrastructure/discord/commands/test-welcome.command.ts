import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../interfaces/command';
import { GetWelcomeMessageUseCase } from '../../../application/use-cases/get-welcome-message';
import { IWelcomeNotifier } from '../../../domain/ports/welcome-notifier.interface';

export class TestWelcomeCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('test-welcome')
    .setDescription('Simula y prueba el mensaje de bienvenida en este canal.');

  constructor(
    private getWelcomeMessage: GetWelcomeMessageUseCase,
    private welcomeNotifier: IWelcomeNotifier
  ) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    if (!interaction.guildId) {
      await interaction.editReply({ content: '❌ Este comando solo puede ser ejecutado dentro de un servidor.' });
      return;
    }

    try {
      // 1. Generar el mensaje de bienvenida simulado usando el usuario actual
      const welcomeMessage = await this.getWelcomeMessage.execute(interaction.user.toString());

      // 2. Enviar el mensaje usando el notificador en el canal actual
      await this.welcomeNotifier.sendWelcome(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
        welcomeMessage
      );

      await interaction.editReply({ content: '✅ Mensaje de prueba enviado al canal.' });
    } catch (error) {
      await interaction.editReply({ 
        content: `❌ Error al simular bienvenida: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }
}