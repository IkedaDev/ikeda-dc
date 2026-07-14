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
          { name: 'Preferencias de Roles', value: 'lineas' },
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

    if (seccion === 'lineas') {
      const mapping = this.configRepository.getPartidasRoleMapping();
      
      if (!mapping || Object.keys(mapping).length === 0) {
        await interaction.reply({ 
          content: '❌ Error: No hay roles configurados para la sección de partidas en el repositorio de configuración.', 
          ephemeral: true 
        });
        return;
      }

      const embed = new EmbedBuilder()
      .setColor('#00f0ff') 
      .setTitle('🗺️ Selecciona tus Líneas')
      .setDescription(
        'Elige los carriles que juegas habitualmente en la Grieta del Invocador para recibir tu rol correspondiente en el servidor:\n\n' +
        '⚔️ **Toplane:** El carril superior. Duelos individuales, tanques y luchadores.\n' +
        '🌲 **Jungla:** El control del mapa. Objetivos, campamentos y emboscadas.\n' +
        '🔮 **Midlane:** El carril central. Magos, asesinos y rotaciones constantes.\n' +
        '🏹 **ADC / Tirador:** El carril inferior. Daño continuo a distancia y escalado.\n' +
        '🛡️ **Support:** La utilidad y visión. Protección, iniciaciones y control de masas.'
      );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('role_pref:lineas:top')
          .setLabel('Top')
          .setEmoji('⚔️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('role_pref:lineas:jg')
          .setLabel('Jungla')
          .setEmoji('🌲')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('role_pref:lineas:mid')
          .setLabel('Mid')
          .setEmoji('🔮')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('role_pref:lineas:adc')
          .setLabel('ADC')
          .setEmoji('🏹')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('role_pref:lineas:supp')
          .setLabel('Support')
          .setEmoji('🛡️')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
}