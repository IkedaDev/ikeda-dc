// src/infrastructure/discord/commands/PingCommand.ts
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command';
import { GetPingStatusUseCase } from '../../../application/use-cases/get-ping-status';

export class PingCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde con un Pong y verifica el estado del bot.');

  constructor(private getPingStatus: GetPingStatusUseCase) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
   await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const message = await this.getPingStatus.execute();
    
    await interaction.editReply({ content: message });
  }
}