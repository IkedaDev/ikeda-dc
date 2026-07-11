// src/infrastructure/discord/commands/TestWelcomeCommand.ts
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags, TextChannel, ColorResolvable } from 'discord.js';
import { Command } from '../interfaces/command';
import { GetWelcomeMessageUseCase } from '../../../application/use-cases/get-welcome-message';

export class TestWelcomeCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('test-welcome')
    .setDescription('Simula y prueba el mensaje de bienvenida en este canal.');

  // Inyectamos el mismo caso de uso de bienvenida
  constructor(private getWelcomeMessage: GetWelcomeMessageUseCase) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // 1. Ocultamos la respuesta inicial del comando para no ensuciar el canal
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // 2. Ejecutamos la lógica de negocio simulando que TÚ eres el usuario nuevo
    const welcomeText = await this.getWelcomeMessage.execute(interaction.user.toString());

    // 3. Reutilizamos la misma estructura visual del Embed de bienvenida
    const welcomeEmbed = new EmbedBuilder()
      .setColor(welcomeText.color as ColorResolvable)
      .setTitle(`[TEST] ${welcomeText.title}`)
      .setDescription(welcomeText.description)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setImage(welcomeText.image)
    //   .setTimestamp()
    //   .setFooter({ text: `Miembro de prueba` });

    const targetChannel = interaction.channel as TextChannel;

    if (targetChannel) {
      await targetChannel.send({ embeds: [welcomeEmbed] });
      await interaction.editReply({ content: '✅ Mensaje de prueba enviado al canal.' });
    } else {
      await interaction.editReply({ content: '❌ No se pudo acceder al canal actual.' });
    }
  }
}