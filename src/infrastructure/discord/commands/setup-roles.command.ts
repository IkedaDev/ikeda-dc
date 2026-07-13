import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits 
} from 'discord.js';
import { Command } from '../interfaces/command';

export class SetupRolesCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Despliega un panel de autogestión de roles.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    // Agregamos un parámetro para elegir qué sección inicializar en el canal
    .addStringOption(option =>
      option.setName('seccion')
        .setDescription('La sección de configuración que deseas desplegar')
        .setRequired(true)
        .addChoices(
          { name: 'Preferencias de Partida', value: 'partidas' },
        )
    ) as SlashCommandBuilder;

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const seccion = interaction.options.get('seccion')?.value as string;

    if (seccion === 'partidas') {
      const embed = new EmbedBuilder()
        .setColor('#1F618D')
        .setTitle('🎮 Preferencias de Partida')
        .setDescription(
          'Selecciona los tipos de juego en los que participas habitualmente para recibir tus roles correspondientes:\n\n' +
          '🏆 **Rankeds / Clasificatorias:** Si buscas tryhardear y subir el elo.\n' +
          '🍻 **Normales / Chill:** Partidas casuales en la Grieta del Invocador.\n' +
          '🧊 **ARAMs:** Diversión rápida y caótica en el Abismo de los Lamentos.\n' +
          '🔥 **Torneos / Eventos:** Mantente al tanto de las inscripciones y ligas internas.'
        )

      // Agregamos el prefijo 'role_pref:partidas:' para identificar la sección en el evento
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('role_pref:partidas:rankeds')
          .setLabel('Rankeds')
          .setEmoji('🏆')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('role_pref:partidas:normales')
          .setLabel('Normales')
          .setEmoji('🍻')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('role_pref:partidas:arams')
          .setLabel('ARAMs')
          .setEmoji('🧊')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('role_pref:partidas:torneos')
          .setLabel('Torneos')
          .setEmoji('🔥')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }


  }
}