import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../interfaces/command';
import { IConfigRepository } from '../../../domain/ports/config-repository.interface';

export class RedesCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('redes')
    .setDescription('Muestra los enlaces oficiales de nuestras redes sociales.');

  constructor(private configRepository: IConfigRepository) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const socialLinks = this.configRepository.getSocialLinks();

    const descriptionLines: string[] = [
      '¡Mantente conectado con nuestra comunidad! Aquí tienes nuestros enlaces oficiales:\n'
    ];

    let hasLinks = false;

    if (socialLinks.whatsapp && socialLinks.whatsapp.trim() !== '') {
      descriptionLines.push(`💬 **WhatsApp:** [Unirse al grupo](${socialLinks.whatsapp.trim()})`);
      hasLinks = true;
    }
    if (socialLinks.facebook && socialLinks.facebook.trim() !== '') {
      descriptionLines.push(`👥 **Facebook:** [Visitar página](${socialLinks.facebook.trim()})`);
      hasLinks = true;
    }
    if (socialLinks.tiktok && socialLinks.tiktok.trim() !== '') {
      descriptionLines.push(`🎵 **TikTok:** [Seguir en TikTok](${socialLinks.tiktok.trim()})`);
      hasLinks = true;
    }
    if (socialLinks.instagram && socialLinks.instagram.trim() !== '') {
      descriptionLines.push(`📸 **Instagram:** [Seguir en Instagram](${socialLinks.instagram.trim()})`);
      hasLinks = true;
    }
    if (socialLinks.web && socialLinks.web.trim() !== '') {
      descriptionLines.push(`🌐 **Sitio Web:** [Visitar sitio web](${socialLinks.web.trim()})`);
      hasLinks = true;
    }

    if (!hasLinks) {
      await interaction.reply({
        content: '❌ No hay redes sociales configuradas en este momento.',
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#9b59b6') // Sleek vibrant purple color
      .setTitle('🔗 Enlaces de Nuestras Redes Sociales')
      .setDescription(descriptionLines.join('\n'))
      .setThumbnail(interaction.guild?.iconURL() || null)
      .setTimestamp()
      .setFooter({ 
        text: interaction.guild?.name || 'Comunidad', 
        iconURL: interaction.guild?.iconURL() || undefined 
      });

    await interaction.reply({ embeds: [embed] });
  }
}
