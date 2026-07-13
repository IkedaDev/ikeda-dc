// src/infrastructure/discord/commands/PingCommand.ts
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command';
import { GetPingStatusUseCase } from '../../../application/use-cases/get-ping-status';
import { IConfigRepository } from '../../../domain/ports/config-repository.interface';

export class PingCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde con un Pong y verifica el estado del bot.');

  constructor(
    private getPingStatus: GetPingStatusUseCase,
    private configRepository: IConfigRepository
  ) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const allowedUsers = this.configRepository.getDeveloperUserIds();
    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({ 
        content: '❌ No tienes permisos para usar este comando.', 
        flags: [MessageFlags.Ephemeral] 
      });
      return;
    }

   await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const message = await this.getPingStatus.execute();
    
    await interaction.editReply({ content: message });
  }
}