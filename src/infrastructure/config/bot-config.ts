import { WelcomeTemplateDto, WebhookAppConfig, SocialLinks } from '../../domain/ports/config-repository.interface';

export interface BotConfig {
  discordToken: string;
  clientId: string;
  guildId: string;
  welcomeChannelId: string;
  defaultRoleIds: string[];
  partidasRoleMapping: Record<string, string>;
  partidasExtraRoleId: string;
  lineasRoleMapping: Record<string, string>;
  welcomeTemplates: WelcomeTemplateDto[];
  developerUserIds: string[];
  webhooks: WebhookAppConfig[];
  socialLinks: SocialLinks;
}

export const botConfig: BotConfig = {
  discordToken: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  socialLinks: {
    whatsapp: 'https://chat.whatsapp.com/DjhDvzEgiAMHP6CFxm6PAK?mode=gi_t',
    facebook: '',
    tiktok: '',
    instagram: 'https://www.instagram.com/gamezone.league/',
    web: '',
  },
  welcomeChannelId: '1279220559787458694',
  defaultRoleIds: ['1524839430454640900'],
  partidasRoleMapping: {
    'rankeds': '1524841271330345190',
    'normales': '1524841077193052251',
    'arams': '1524972549782638683',
    'torneos': '1524841327144079441',
  },
  partidasExtraRoleId: '1524840821839626250',
  lineasRoleMapping: {
    'top': '1524841608451854366',
    'jg': '1524841840124362823',
    'mid': '1524841692866281533',
    'adc': '1524842084513615923',
    'supp': '1524841744854810834',
  },

  webhooks: [
    {
      appId: 'default',
      channelId: process.env.WEBHOOK_DEFAULT_CHANNEL_ID || '1525595909994315957',
      webhookUrl: process.env.WEBHOOK_DEFAULT_DISCORD_URL,
    },
  ],
  developerUserIds: [
    '410457473892483072', 
  ],
  welcomeTemplates: [
    // --- Regiones de Runaterra ---
    {
      title: '⚔️ ¡Por Demacia!',
      template: '{user} ha cruzado nuestras fronteras dispuesto a defender la justicia con honor.',
      color: '#F4F6F7',
      image: "https://i.imgur.com/veROHNQ.jpeg",
    },
    {
      title: '🪓 ¡Noxus necesita vuestra fuerza!',
      template: '{user} se une a las filas del imperio buscando gloria en la arena de batalla.',
      color: '#C0392B',
      image: "https://cdna.artstation.com/p/assets/images/images/075/606/724/large/prophetein-3333-0000.jpg?1715005723",
    },
    {
      title: '🌸 El equilibrio de Jonia',
      template: '¡Bienvenido, {user}! Que el espíritu de las tierras jónicas guíe tus pasos en el servidor.',
      color: '#D2B4DE',
      image: "https://ykeradionet.wordpress.com/wp-content/uploads/2020/01/lol-universe-2020.png",
    },
    {
      title: '⚙️ Progreso Hextech',
      template: '¡{user} acaba de descender de los dirigibles de Piltover con los bolsillos llenos de tecnología!',
      color: '#F39C12',
      image: "https://wiki.leagueoflegends.com/en-us/images/thumb/05PZ022T1-full.png/1200px-05PZ022T1-full.png?b0feb",
    },
    {
      title: '🧪 Alerta en los distritos de Zaun',
      template: '¡Cuidado! {user} ha sobrevivido a los callejones químicos. ¡Ponte a cubierto!',
      color: '#2ECC71',
      image: "https://cdnb.artstation.com/p/assets/images/images/017/226/945/large/patrick-faulwetter-pfaulwetter-zaun-03-as.jpg?1555116404",
    },
    {
      title: '❄️ Hijos del Hielo',
      template: 'El frío del Freljord forja espíritus duros. ¡Alza tu copa de hidromiel por {user}!',
      color: '#3498DB',
      image: "https://leaguefactions.net/wp-content/uploads/2014/03/freljord.jpg",
    },
    {
      title: '🏴‍☠️ Muelles de Aguas Estancadas',
      template: '{user} ha desembarcado. Cuida tus monedas de oro y vigila tu espalda.',
      color: '#1A5276',
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/8/81/Maxresdefault-3.jpg/revision/latest?cb=20160507045805&path-prefix=es",
    },
    {
      title: '☀️ El Ascenso de Shurima',
      template: '¡El disco solar se eleva! Alabad la llegada del Ascendido {user} a las arenas.',
      color: '#F1C40F',
      image: "https://cdn.turbosmurfs.gg/the_emperors_army_azir_knows_shurima_as_it_was_is_and_will_v0_f19ufzsbl3wc1_ed4cbb2984.webp",
    },
    {
      title: '🌌 Aspecto Estelar del Targon',
      template: 'Las estrellas han hablado. ¡{user} ha completado el ascenso al Monte Targon!',
      color: '#2E4053',
      image: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg?accountingTag=LoL",
    },
    {
      title: '👻 Niebla de las Islas de la Sombra',
      template: 'Las brumas se abren... {user} ha entrado. ¡Espero que no sea otro espectro!',
      color: '#117A65',
      image: "https://static1-es.millenium.gg/articles/3/54/33/@/32478-1174833-shadow-isles-concept-3-orig-1-article_cover_bd-1.jpg",
    },
    {
      title: '👾 Brecha del Vacío Detectada',
      template: '¡La realidad se desgarra! {user} ha emergido de las profundidades de la nada.',
      color: '#8E44AD',
      image: "https://i0.wp.com/lavidaesunvideojuego.com/wp-content/uploads/2022/06/vel-beth-league-of-legends-la-vida-es-un-videojuego-thumb-1.jpg?fit=1400%2C788&ssl=1",
    },
    {
      title: '🍄 Portales de la Ciudad de Bandle',
      template: '¡{user} llega saltando listo para armar un caos del tamaño de un Yordle!',
      color: '#E67E22',
      image: "https://cdnb.artstation.com/p/assets/images/images/051/264/651/large/tim-warnock-nf-set5environments-tristana-citycentralplaza-a-03.jpg?1656872682",
    },
    {
      title: '🌿 Los Axiomas de Ixtal',
      template: 'La tierra y los elementos se alinean. ¡Demos la bienvenida al maestro elemental {user}!',
      color: '#27AE60',
      image: "https://i.postimg.cc/6QDM8TGQ/Ixtal.png",
    },
    {
      title: '⛓️ La Linterna del Carcelero',
      template: '¡Cuidado en los caminos! {user} ha entrado y Thresh ya está preparando su linterna.',
      color: '#138D75',
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/e/ed/01SI052-full.png/revision/latest/scale-to-width-down/1200?cb=20200407034420",
    },
    {
      title: '🎭 La Obra Maestra de Jhin',
      template: '"La vida no es más que una obra... ¡y tu llegada es el acto principal!", aclama el virtuoso a {user}.',
      color: '#E5E7E9',
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jhin_0.jpg",
    },
    {
      title: '👑 El Rey Arruinado',
      template: '¡{user} ha sido reclamado por la Niebla Negra de Viego! Sálvese quien pueda.',
      color: '#0E6251',
      image: "https://i.pinimg.com/736x/db/c9/6c/dbc96c2ca4bcd74b18251030633bac34.jpg",
    },
    {
      title: '🛡️ El Corazón de Freljord',
      template: '¡Braum está aquí! Deja tus preocupaciones, {user}, su escudo protege tus espaldas.',
      color: '#5DADE2',
      image: "https://images3.alphacoders.com/107/thumb-1920-1077693.jpg",
    },
    {
      title: '🎯 ¡Cuidado con el Gancho!',
      template: 'Blitzcrank ha lanzado su agarre biónico desde la maleza y ha arrastrado a {user} al canal.',
      color: '#D35400',
      image: "https://c4.wallpaperflare.com/wallpaper/109/774/375/league-of-legends-video-games-blitzcrank-league-of-legends-wallpaper-preview.jpg",
    },
    {
      title: '📦 ¡Gankeo Sorpresa!',
      template: '{user} apareció saltando desde el arbusto directo a la línea sin que los wards lo vieran.',
      color: '#7F8C8D',
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/c/ce/04SH067T1-full.png/revision/latest?cb=20210220184910",
    },
    {
      title: '🌟 El Forjador de Estrellas',
      template: 'Aurelion Sol detiene la creación de galaxias enteras para observar la llegada de {user}.',
      color: '#1F618D',
      image: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/c300f92e480f8a712dcb6196266a590618a03d5a-853x480.jpg?accountingTag=LoL",
    }
  ]
};
