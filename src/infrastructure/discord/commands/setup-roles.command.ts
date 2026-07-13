import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits, 
  MessageFlags
} from 'discord.js';
import { Command } from '../interfaces/command';
import { IConfigRepository } from '../../../domain/ports/config-repository.interface';

export class SetupRolesCommand implements Command {
  public data = new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Despliega un panel de autogestión de roles.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('seccion')
        .setDescription('La sección de configuración que deseas desplegar')
        .setRequired(true)
        .addChoices(
          { name: 'Preferencias de Partida', value: 'partidas' },
        )
    ) as SlashCommandBuilder;

  constructor(private configRepository: IConfigRepository) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {

    const allowedUsers = this.configRepository.getDeveloperUserIds();
    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({ 
        content: '❌ No tienes permisos para usar este comando.', 
        flags: [MessageFlags.Ephemeral] 
      });
      return;
    }


    const seccion = interaction.options.getString('seccion', true);

    if (seccion === 'partidas') {
      const mapping = this.configRepository.getPartidasRoleMapping();
      
      // Validamos que existan roles configurados en la infraestructura
      if (!mapping || Object.keys(mapping).length === 0) {
        await interaction.reply({ 
          content: '❌ Error: No hay roles configurados para la sección de partidas en el repositorio de configuración.', 
          ephemeral: true 
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#1F618D')
        .setTitle('🎮 Preferencias de Partida')
        .setDescription(
          'Selecciona los tipos de juego en los que participas habitualmente para recibir tus roles correspondientes:\n\n' +
          '🏆 **Rankeds / Clasificatorias:** Si buscas tryhardear y subir el elo.\n' +
          '🍻 **Normales / Chill:** Partidas casuales en la Grieta del Invocador.\n' +
          '🧊 **ARAMs:** Diversión rápida y caótica en el Abismo de los Lamentos.\n' +
          '🔥 **Torneos / Eventos:** Mantente al tanto de las inscripciones y ligas internas.'
        );

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
    }
  }
}