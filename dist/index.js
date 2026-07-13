// src/index.ts
import "dotenv/config";
import { Client as Client3, Events as Events3, GatewayIntentBits } from "discord.js";
import { asValue } from "awilix";

// src/container.ts
import { createContainer, asClass, InjectionMode, asFunction } from "awilix";

// src/infrastructure/logger/console-logger.ts
var ConsoleLogger = class {
  formatMessage(level, colorCode, message) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const resetCode = "\x1B[0m";
    return `${colorCode}[${timestamp}] [${level}]${resetCode} ${message}`;
  }
  info(message, ...meta) {
    console.log(this.formatMessage("INFO", "\x1B[36m", message), ...meta);
  }
  warn(message, ...meta) {
    console.warn(this.formatMessage("WARN", "\x1B[33m", message), ...meta);
  }
  error(message, error, ...meta) {
    console.error(this.formatMessage("ERROR", "\x1B[31m", message), ...meta);
    if (error) {
      console.error(error);
    }
  }
  debug(message, ...meta) {
    console.debug(this.formatMessage("DEBUG", "\x1B[90m", message), ...meta);
  }
};

// src/infrastructure/config/bot-config.ts
var botConfig = {
  discordToken: process.env.DISCORD_TOKEN || "",
  clientId: process.env.CLIENT_ID || "",
  guildId: process.env.GUILD_ID || "",
  welcomeChannelId: "1279220559787458694",
  defaultRoleIds: ["1524839430454640900"],
  partidasRoleMapping: {
    "rankeds": "1524841271330345190",
    "normales": "1524841077193052251",
    "arams": "1524972549782638683",
    "torneos": "1524841327144079441"
  },
  webhooks: [
    {
      appId: "default",
      channelId: process.env.WEBHOOK_DEFAULT_CHANNEL_ID || "1279220559787458694",
      webhookUrl: process.env.WEBHOOK_DEFAULT_DISCORD_URL
    },
    {
      appId: "github",
      channelId: process.env.WEBHOOK_GITHUB_CHANNEL_ID || "1279220559787458694",
      webhookUrl: process.env.WEBHOOK_GITHUB_DISCORD_URL
    },
    {
      appId: "stripe",
      channelId: process.env.WEBHOOK_STRIPE_CHANNEL_ID || "1279220559787458694",
      webhookUrl: process.env.WEBHOOK_STRIPE_DISCORD_URL
    }
  ],
  developerUserIds: [
    "410457473892483072"
  ],
  welcomeTemplates: [
    // --- Regiones de Runaterra ---
    {
      title: "\u2694\uFE0F \xA1Por Demacia!",
      template: "{user} ha cruzado nuestras fronteras dispuesto a defender la justicia con honor.",
      color: "#F4F6F7",
      image: "https://i.imgur.com/veROHNQ.jpeg"
    },
    {
      title: "\u{1FA93} \xA1Noxus necesita vuestra fuerza!",
      template: "{user} se une a las filas del imperio buscando gloria en la arena de batalla.",
      color: "#C0392B",
      image: "https://cdna.artstation.com/p/assets/images/images/075/606/724/large/prophetein-3333-0000.jpg?1715005723"
    },
    {
      title: "\u{1F338} El equilibrio de Jonia",
      template: "\xA1Bienvenido, {user}! Que el esp\xEDritu de las tierras j\xF3nicas gu\xEDe tus pasos en el servidor.",
      color: "#D2B4DE",
      image: "https://ykeradionet.wordpress.com/wp-content/uploads/2020/01/lol-universe-2020.png"
    },
    {
      title: "\u2699\uFE0F Progreso Hextech",
      template: "\xA1{user} acaba de descender de los dirigibles de Piltover con los bolsillos llenos de tecnolog\xEDa!",
      color: "#F39C12",
      image: "https://wiki.leagueoflegends.com/en-us/images/thumb/05PZ022T1-full.png/1200px-05PZ022T1-full.png?b0feb"
    },
    {
      title: "\u{1F9EA} Alerta en los distritos de Zaun",
      template: "\xA1Cuidado! {user} ha sobrevivido a los callejones qu\xEDmicos. \xA1Ponte a cubierto!",
      color: "#2ECC71",
      image: "https://cdnb.artstation.com/p/assets/images/images/017/226/945/large/patrick-faulwetter-pfaulwetter-zaun-03-as.jpg?1555116404"
    },
    {
      title: "\u2744\uFE0F Hijos del Hielo",
      template: "El fr\xEDo del Freljord forja esp\xEDritus duros. \xA1Alza tu copa de hidromiel por {user}!",
      color: "#3498DB",
      image: "https://leaguefactions.net/wp-content/uploads/2014/03/freljord.jpg"
    },
    {
      title: "\u{1F3F4}\u200D\u2620\uFE0F Muelles de Aguas Estancadas",
      template: "{user} ha desembarcado. Cuida tus monedas de oro y vigila tu espalda.",
      color: "#1A5276",
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/8/81/Maxresdefault-3.jpg/revision/latest?cb=20160507045805&path-prefix=es"
    },
    {
      title: "\u2600\uFE0F El Ascenso de Shurima",
      template: "\xA1El disco solar se eleva! Alabad la llegada del Ascendido {user} a las arenas.",
      color: "#F1C40F",
      image: "https://cdn.turbosmurfs.gg/the_emperors_army_azir_knows_shurima_as_it_was_is_and_will_v0_f19ufzsbl3wc1_ed4cbb2984.webp"
    },
    {
      title: "\u{1F30C} Aspecto Estelar del Targon",
      template: "Las estrellas han hablado. \xA1{user} ha completado el ascenso al Monte Targon!",
      color: "#2E4053",
      image: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/universe/f81004a39c5502d766169beb4a342c46b0030d36-1920x946.jpg?accountingTag=LoL"
    },
    {
      title: "\u{1F47B} Niebla de las Islas de la Sombra",
      template: "Las brumas se abren... {user} ha entrado. \xA1Espero que no sea otro espectro!",
      color: "#117A65",
      image: "https://static1-es.millenium.gg/articles/3/54/33/@/32478-1174833-shadow-isles-concept-3-orig-1-article_cover_bd-1.jpg"
    },
    {
      title: "\u{1F47E} Brecha del Vac\xEDo Detectada",
      template: "\xA1La realidad se desgarra! {user} ha emergido de las profundidades de la nada.",
      color: "#8E44AD",
      image: "https://i0.wp.com/lavidaesunvideojuego.com/wp-content/uploads/2022/06/vel-beth-league-of-legends-la-vida-es-un-videojuego-thumb-1.jpg?fit=1400%2C788&ssl=1"
    },
    {
      title: "\u{1F344} Portales de la Ciudad de Bandle",
      template: "\xA1{user} llega saltando listo para armar un caos del tama\xF1o de un Yordle!",
      color: "#E67E22",
      image: "https://cdnb.artstation.com/p/assets/images/images/051/264/651/large/tim-warnock-nf-set5environments-tristana-citycentralplaza-a-03.jpg?1656872682"
    },
    {
      title: "\u{1F33F} Los Axiomas de Ixtal",
      template: "La tierra y los elementos se alinean. \xA1Demos la bienvenida al maestro elemental {user}!",
      color: "#27AE60",
      image: "https://i.postimg.cc/6QDM8TGQ/Ixtal.png"
    },
    {
      title: "\u26D3\uFE0F La Linterna del Carcelero",
      template: "\xA1Cuidado en los caminos! {user} ha entrado y Thresh ya est\xE1 preparando su linterna.",
      color: "#138D75",
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/e/ed/01SI052-full.png/revision/latest/scale-to-width-down/1200?cb=20200407034420"
    },
    {
      title: "\u{1F3AD} La Obra Maestra de Jhin",
      template: '"La vida no es m\xE1s que una obra... \xA1y tu llegada es el acto principal!", aclama el virtuoso a {user}.',
      color: "#E5E7E9",
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jhin_0.jpg"
    },
    {
      title: "\u{1F451} El Rey Arruinado",
      template: "\xA1{user} ha sido reclamado por la Niebla Negra de Viego! S\xE1lvese quien pueda.",
      color: "#0E6251",
      image: "https://i.pinimg.com/736x/db/c9/6c/dbc96c2ca4bcd74b18251030633bac34.jpg"
    },
    {
      title: "\u{1F6E1}\uFE0F El Coraz\xF3n de Freljord",
      template: "\xA1Braum est\xE1 aqu\xED! Deja tus preocupaciones, {user}, su escudo protege tus espaldas.",
      color: "#5DADE2",
      image: "https://images3.alphacoders.com/107/thumb-1920-1077693.jpg"
    },
    {
      title: "\u{1F3AF} \xA1Cuidado con el Gancho!",
      template: "Blitzcrank ha lanzado su agarre bi\xF3nico desde la maleza y ha arrastrado a {user} al canal.",
      color: "#D35400",
      image: "https://c4.wallpaperflare.com/wallpaper/109/774/375/league-of-legends-video-games-blitzcrank-league-of-legends-wallpaper-preview.jpg"
    },
    {
      title: "\u{1F4E6} \xA1Gankeo Sorpresa!",
      template: "{user} apareci\xF3 saltando desde el arbusto directo a la l\xEDnea sin que los wards lo vieran.",
      color: "#7F8C8D",
      image: "https://static.wikia.nocookie.net/leagueoflegends/images/c/ce/04SH067T1-full.png/revision/latest?cb=20210220184910"
    },
    {
      title: "\u{1F31F} El Forjador de Estrellas",
      template: "Aurelion Sol detiene la creaci\xF3n de galaxias enteras para observar la llegada de {user}.",
      color: "#1F618D",
      image: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/c300f92e480f8a712dcb6196266a590618a03d5a-853x480.jpg?accountingTag=LoL"
    }
  ]
};

// src/infrastructure/config/static-config.repository.ts
var StaticConfigRepository = class {
  getWelcomeChannelId() {
    return botConfig.welcomeChannelId;
  }
  getDefaultRoleIds() {
    return botConfig.defaultRoleIds;
  }
  getWelcomeTemplates() {
    return botConfig.welcomeTemplates;
  }
  getPartidasRoleMapping() {
    return botConfig.partidasRoleMapping;
  }
  getBotToken() {
    return botConfig.discordToken;
  }
  getClientId() {
    return botConfig.clientId;
  }
  getGuildId() {
    return botConfig.guildId;
  }
  getDeveloperUserIds() {
    return botConfig.developerUserIds;
  }
  getWebhookConfig(appId) {
    return botConfig.webhooks.find((w) => w.appId === appId);
  }
};

// src/infrastructure/discord/services/discord-role.service.ts
var DiscordRoleService = class {
  // En Awilix inyectamos el cliente registrado como 'discordClient'
  constructor(discordClient) {
    this.discordClient = discordClient;
  }
  discordClient;
  async getMember(guildId, memberId) {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado.`);
    }
    const member = await guild.members.fetch(memberId);
    if (!member) {
      throw new Error(`Miembro con ID ${memberId} no encontrado en el servidor ${guildId}.`);
    }
    return member;
  }
  async assignRole(guildId, memberId, roleId) {
    const member = await this.getMember(guildId, memberId);
    await member.roles.add(roleId);
  }
  async removeRole(guildId, memberId, roleId) {
    const member = await this.getMember(guildId, memberId);
    await member.roles.remove(roleId);
  }
  async hasRole(guildId, memberId, roleId) {
    const member = await this.getMember(guildId, memberId);
    return member.roles.cache.has(roleId);
  }
  async getRoleName(guildId, roleId) {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado.`);
    }
    const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId);
    if (!role) {
      throw new Error(`Rol con ID ${roleId} no encontrado en el servidor ${guildId}.`);
    }
    return role.name;
  }
};

// src/infrastructure/discord/services/discord-welcome-notifier.ts
import { EmbedBuilder } from "discord.js";
var DiscordWelcomeNotifier = class {
  constructor(discordClient) {
    this.discordClient = discordClient;
  }
  discordClient;
  async sendWelcome(guildId, channelId, memberId, message) {
    const guild = await this.discordClient.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Servidor con ID ${guildId} no encontrado para enviar la bienvenida.`);
    }
    let channel = guild.channels.cache.get(channelId);
    if (!channel) {
      channel = await guild.channels.fetch(channelId);
    }
    const targetChannel = channel || guild.systemChannel;
    if (!targetChannel) {
      throw new Error(`No se pudo encontrar el canal de bienvenida ${channelId} ni el canal de sistema del servidor.`);
    }
    const member = await guild.members.fetch(memberId);
    if (!member) {
      throw new Error(`Miembro con ID ${memberId} no encontrado para formatear la bienvenida.`);
    }
    const welcomeEmbed = new EmbedBuilder().setColor(message.color).setTitle(message.title).setDescription(message.description).setThumbnail(member.user.displayAvatarURL({ size: 256 }));
    if (message.image) {
      welcomeEmbed.setImage(message.image);
    }
    await targetChannel.send({ embeds: [welcomeEmbed] });
  }
};

// src/infrastructure/discord/services/discord-notifier.ts
import { TextChannel as TextChannel2, WebhookClient } from "discord.js";
var DiscordNotifier = class {
  constructor(discordClient) {
    this.discordClient = discordClient;
  }
  discordClient;
  async sendToChannel(channelId, options) {
    const channel = await this.discordClient.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel2)) {
      throw new Error(`Canal de Discord no encontrado o no es de texto: ${channelId}`);
    }
    await channel.send({
      content: options.content,
      embeds: options.embeds
    });
  }
  async sendToWebhook(webhookUrl, options) {
    const webhookClient = new WebhookClient({ url: webhookUrl });
    await webhookClient.send({
      content: options.content,
      embeds: options.embeds,
      username: options.username,
      avatarURL: options.avatarUrl
    });
  }
};

// src/infrastructure/webhooks/handlers/default.webhook-handler.ts
var DefaultWebhookHandler = class {
  appId = "default";
  async handle(payload, headers) {
    const content = payload?.content || payload?.message || (payload ? `\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`` : "Webhook vac\xEDo");
    const embeds = payload?.embeds || [];
    return {
      content: content.length > 2e3 ? `${content.substring(0, 1990)}...` : content,
      embeds,
      username: payload?.username || "Notificaciones Ikeda",
      avatarUrl: payload?.avatarUrl || "https://i.imgur.com/veROHNQ.jpeg"
    };
  }
};

// src/infrastructure/webhooks/handlers/github.webhook-handler.ts
var GithubWebhookHandler = class {
  appId = "github";
  async handle(payload, headers) {
    const event = headers["x-github-event"] || "unknown";
    if (event === "ping") {
      return {
        embeds: [
          {
            title: "\u{1F7E2} GitHub Webhook Vinculado",
            description: `El webhook ha sido configurado con \xE9xito para el repositorio: **${payload?.repository?.full_name}**`,
            color: 3066993,
            // Green
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        username: "GitHub",
        avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      };
    }
    if (event === "push") {
      const repoName = payload.repository?.name || "repo";
      const repoUrl = payload.repository?.html_url || "";
      const pusher = payload.pusher?.name || "unknown";
      const ref = payload.ref || "";
      const branch = ref.replace("refs/heads/", "");
      const commits = payload.commits || [];
      let commitListText = "";
      if (commits.length > 0) {
        commitListText = commits.slice(0, 5).map((c) => `[\`${c.id.substring(0, 7)}\`](${c.url}) - ${c.message.split("\n")[0]} (por *${c.author.name}*)`).join("\n");
        if (commits.length > 5) {
          commitListText += `
*y ${commits.length - 5} commits m\xE1s...*`;
        }
      } else {
        commitListText = "No hay commits en este push.";
      }
      return {
        embeds: [
          {
            title: `\u{1F680} Push detectado en [${repoName}:${branch}]`,
            url: `${repoUrl}/tree/${branch}`,
            description: commitListText,
            color: 616922,
            // GitHub Blue
            author: {
              name: pusher,
              icon_url: payload.sender?.avatar_url || ""
            },
            footer: {
              text: `GitHub Webhooks \u2022 ${repoName}`
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        username: "GitHub",
        avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      };
    }
    if (event === "pull_request") {
      const action = payload.action;
      const pr = payload.pull_request;
      const repoName = payload.repository?.name || "repo";
      const user = pr?.user?.login || "unknown";
      const title = pr?.title || "No Title";
      const url = pr?.html_url || "";
      let color = 2991182;
      let actionWord = "abierto";
      if (action === "closed") {
        if (pr?.merged) {
          color = 8540383;
          actionWord = "fusionado \u{1F49C}";
        } else {
          color = 13574702;
          actionWord = "cerrado \u{1F534}";
        }
      }
      return {
        embeds: [
          {
            title: `\u{1F50C} Pull Request ${actionWord} en ${repoName}`,
            url,
            description: `**#${pr?.number} - ${title}**

Modificaciones: \`+${pr?.additions}\` \`-${pr?.deletions}\` en \`${pr?.changed_files}\` archivos.`,
            color,
            author: {
              name: user,
              icon_url: pr?.user?.avatar_url || ""
            },
            footer: {
              text: `GitHub Webhooks \u2022 ${repoName}`
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        username: "GitHub",
        avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      };
    }
    return {
      embeds: [
        {
          title: `\u{1F514} Evento GitHub: ${event}`,
          description: `Se recibi\xF3 una notificaci\xF3n de GitHub del tipo \`${event}\`.`,
          color: 2369839,
          // GitHub Dark Gray
          footer: {
            text: `GitHub Webhooks \u2022 ${payload?.repository?.name || "Desconocido"}`
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      username: "GitHub",
      avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    };
  }
};

// src/infrastructure/webhooks/handlers/stripe.webhook-handler.ts
var StripeWebhookHandler = class {
  appId = "stripe";
  async handle(payload, headers) {
    const eventType = payload.type || "unknown";
    const dataObject = payload.data?.object || {};
    if (eventType === "checkout.session.completed") {
      const customerEmail = dataObject.customer_details?.email || "N/A";
      const amountTotal = (dataObject.amount_total || 0) / 100;
      const currency = (dataObject.currency || "USD").toUpperCase();
      const paymentStatus = dataObject.payment_status || "unknown";
      return {
        embeds: [
          {
            title: "\u{1F4B3} Sesi\xF3n de Pago Completada (Stripe)",
            description: `Se ha procesado una compra con \xE9xito.`,
            color: 6511615,
            // Stripe Purple
            fields: [
              { name: "Cliente", value: customerEmail, inline: true },
              { name: "Monto Total", value: `**$${amountTotal.toFixed(2)} ${currency}**`, inline: true },
              { name: "Estado", value: `\`${paymentStatus.toUpperCase()}\``, inline: true }
            ],
            footer: {
              text: "Stripe Webhooks"
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        username: "Stripe Payments",
        avatarUrl: "https://cdn.brandfolder.io/5H442UZV/at/pgyv6t-622838-89q2x/Stripe_Logo_-_Glyph.png"
      };
    }
    if (eventType === "payment_intent.succeeded") {
      const amount = (dataObject.amount || 0) / 100;
      const currency = (dataObject.currency || "USD").toUpperCase();
      const customerId = dataObject.customer || "Invitado";
      return {
        embeds: [
          {
            title: "\u2705 Pago Exitoso (Payment Intent)",
            description: `Se ha recibido un pago correctamente.`,
            color: 3066993,
            // Green
            fields: [
              { name: "ID del Cliente", value: customerId, inline: true },
              { name: "Monto", value: `**$${amount.toFixed(2)} ${currency}**`, inline: true }
            ],
            footer: {
              text: "Stripe Webhooks"
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ],
        username: "Stripe Payments",
        avatarUrl: "https://cdn.brandfolder.io/5H442UZV/at/pgyv6t-622838-89q2x/Stripe_Logo_-_Glyph.png"
      };
    }
    return {
      embeds: [
        {
          title: `\u{1F514} Evento Stripe: ${eventType}`,
          description: `Se recibi\xF3 un evento del tipo \`${eventType}\` desde la plataforma de pagos.`,
          color: 6511615,
          footer: {
            text: "Stripe Webhooks"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      username: "Stripe Payments",
      avatarUrl: "https://cdn.brandfolder.io/5H442UZV/at/pgyv6t-622838-89q2x/Stripe_Logo_-_Glyph.png"
    };
  }
};

// src/application/webhook-handler-registry.ts
var WebhookHandlerRegistry = class {
  handlers = /* @__PURE__ */ new Map();
  constructor(handlers) {
    for (const handler of handlers) {
      this.handlers.set(handler.appId, handler);
    }
  }
  getHandler(appId) {
    return this.handlers.get(appId);
  }
};

// src/application/use-cases/get-ping-status.ts
var GetPingStatusUseCase = class {
  constructor(logger) {
    this.logger = logger;
  }
  logger;
  async execute() {
    this.logger.debug("GetPingStatusUseCase: ejecutando verificaci\xF3n de latencia.");
    return "\xA1Pong! \u{1F3D3} El sistema est\xE1 operacional.";
  }
};

// src/domain/entities/welcome-message.ts
var WelcomeMessage = class {
  title;
  description;
  color;
  image;
  constructor(props) {
    this.title = props.title;
    this.description = props.description;
    this.color = props.color;
    this.image = props.image;
  }
};

// src/application/use-cases/get-welcome-message.ts
var GetWelcomeMessageUseCase = class {
  constructor(configRepository, logger) {
    this.configRepository = configRepository;
    this.logger = logger;
  }
  configRepository;
  logger;
  async execute(username) {
    const templates = this.configRepository.getWelcomeTemplates();
    if (templates.length === 0) {
      this.logger.warn("No hay plantillas de bienvenida configuradas.");
      return new WelcomeMessage({
        title: "\xA1Bienvenido!",
        description: `Hola ${username}, \xA1bienvenido al servidor!`,
        color: "#3498DB",
        image: ""
      });
    }
    const randomIndex = Math.floor(Math.random() * templates.length);
    const selected = templates[randomIndex];
    this.logger.info(`Plantilla de bienvenida seleccionada: "${selected.title}" para el usuario: ${username}`);
    return new WelcomeMessage({
      title: selected.title,
      description: selected.template.replace("{user}", username),
      color: selected.color,
      image: selected.image
    });
  }
};

// src/application/use-cases/handle-new-member.ts
var HandleNewMemberUseCase = class {
  constructor(configRepository, roleService, welcomeNotifier, getWelcomeMessage, logger) {
    this.configRepository = configRepository;
    this.roleService = roleService;
    this.welcomeNotifier = welcomeNotifier;
    this.getWelcomeMessage = getWelcomeMessage;
    this.logger = logger;
  }
  configRepository;
  roleService;
  welcomeNotifier;
  getWelcomeMessage;
  logger;
  async execute(guildId, memberId, username, memberTag) {
    this.logger.info(`Iniciando flujo de nuevo miembro para ${memberTag} (${memberId}) en servidor ${guildId}`);
    try {
      const welcomeChannelId = this.configRepository.getWelcomeChannelId();
      const welcomeMessage = await this.getWelcomeMessage.execute(username);
      await this.welcomeNotifier.sendWelcome(guildId, welcomeChannelId, memberId, welcomeMessage);
      this.logger.info(`Mensaje de bienvenida enviado con \xE9xito para ${memberTag}`);
    } catch (error) {
      this.logger.error(`Error al enviar mensaje de bienvenida para ${memberTag}:`, error);
    }
    try {
      const defaultRoleIds = this.configRepository.getDefaultRoleIds();
      if (defaultRoleIds.length > 0) {
        for (const roleId of defaultRoleIds) {
          await this.roleService.assignRole(guildId, memberId, roleId);
        }
        this.logger.info(`Roles por defecto (${defaultRoleIds.join(", ")}) asignados con \xE9xito a ${memberTag}`);
      }
    } catch (error) {
      this.logger.error(`Error al asignar roles por defecto a ${memberTag}:`, error);
    }
  }
};

// src/application/use-cases/toggle-member-role-preference.ts
var ToggleMemberRolePreferenceUseCase = class {
  constructor(configRepository, roleService, logger) {
    this.configRepository = configRepository;
    this.roleService = roleService;
    this.logger = logger;
  }
  configRepository;
  roleService;
  logger;
  async execute(guildId, memberId, section, roleKey) {
    this.logger.info(`ToggleMemberRolePreferenceUseCase: miembro ${memberId} solicita alternar rol para ${section}:${roleKey}`);
    let roleId;
    if (section === "partidas") {
      const mapping = this.configRepository.getPartidasRoleMapping();
      roleId = mapping[roleKey];
    }
    if (!roleId) {
      this.logger.warn(`No se encontr\xF3 configuraci\xF3n de rol para secci\xF3n "${section}" y clave "${roleKey}"`);
      throw new Error("Configuraci\xF3n de rol no encontrada en el sistema.");
    }
    const hasRole = await this.roleService.hasRole(guildId, memberId, roleId);
    const roleName = await this.roleService.getRoleName(guildId, roleId);
    if (hasRole) {
      await this.roleService.removeRole(guildId, memberId, roleId);
      this.logger.info(`Rol "${roleName}" (${roleId}) removido del miembro ${memberId}`);
      return {
        success: true,
        action: "removed",
        roleName
      };
    } else {
      await this.roleService.assignRole(guildId, memberId, roleId);
      this.logger.info(`Rol "${roleName}" (${roleId}) asignado al miembro ${memberId}`);
      return {
        success: true,
        action: "added",
        roleName
      };
    }
  }
};

// src/application/use-cases/process-webhook.ts
var ProcessWebhookUseCase = class {
  constructor(webhookHandlerRegistry, discordNotifier, configRepository, logger) {
    this.webhookHandlerRegistry = webhookHandlerRegistry;
    this.discordNotifier = discordNotifier;
    this.configRepository = configRepository;
    this.logger = logger;
  }
  webhookHandlerRegistry;
  discordNotifier;
  configRepository;
  logger;
  async execute(appId, payload, headers) {
    this.logger.info(`Procesando webhook entrante para appId: ${appId}`);
    const config = this.configRepository.getWebhookConfig(appId);
    if (!config) {
      throw new Error(`No se encontr\xF3 configuraci\xF3n de webhook para la app: ${appId}`);
    }
    let handler = this.webhookHandlerRegistry.getHandler(appId);
    if (!handler) {
      this.logger.warn(`No se encontr\xF3 handler espec\xEDfico para "${appId}". Usando handler por defecto.`);
      handler = this.webhookHandlerRegistry.getHandler("default");
    }
    if (!handler) {
      throw new Error(`No se encontr\xF3 handler (ni el por defecto) para la app: ${appId}`);
    }
    const messageOptions = await handler.handle(payload, headers);
    if (config.webhookUrl) {
      this.logger.info(`Enviando mensaje de webhook para "${appId}" v\xEDa webhook de Discord.`);
      await this.discordNotifier.sendToWebhook(config.webhookUrl, messageOptions);
    } else if (config.channelId) {
      this.logger.info(`Enviando mensaje de webhook para "${appId}" al canal de Discord: ${config.channelId}`);
      await this.discordNotifier.sendToChannel(config.channelId, messageOptions);
    } else {
      throw new Error(`La configuraci\xF3n de "${appId}" no tiene channelId ni webhookUrl.`);
    }
  }
};

// src/infrastructure/http/controllers/webhook.controller.ts
var WebhookController = class {
  constructor(processWebhook, logger) {
    this.processWebhook = processWebhook;
    this.logger = logger;
  }
  processWebhook;
  logger;
  handleWebhook = async (req, res) => {
    const { appId } = req.params;
    const payload = req.body;
    const headers = req.headers;
    try {
      await this.processWebhook.execute(appId, payload, headers);
      res.status(200).json({ success: true, message: `Webhook procesado con \xE9xito para: ${appId}` });
    } catch (error) {
      this.logger.error(`Error procesando webhook de ${appId}: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

// src/infrastructure/http/server.ts
import express from "express";
var ExpressServer = class {
  constructor(webhookController, logger) {
    this.webhookController = webhookController;
    this.logger = logger;
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }
  webhookController;
  logger;
  app;
  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
  setupRoutes() {
    this.app.post("/webhooks/:appId", this.webhookController.handleWebhook);
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "OK", timestamp: /* @__PURE__ */ new Date() });
    });
  }
  start() {
    const port = process.env.PORT || 3e3;
    this.app.listen(port, () => {
      this.logger.info(`\u{1F310} Servidor HTTP escuchando en el puerto ${port}`);
    });
  }
};

// src/infrastructure/discord/commands/ping-command.ts
import { MessageFlags, SlashCommandBuilder } from "discord.js";
var PingCommand = class {
  constructor(getPingStatus, configRepository) {
    this.getPingStatus = getPingStatus;
    this.configRepository = configRepository;
  }
  getPingStatus;
  configRepository;
  data = new SlashCommandBuilder().setName("ping").setDescription("Responde con un Pong y verifica el estado del bot.");
  async execute(interaction) {
    const allowedUsers = this.configRepository.getDeveloperUserIds();
    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: "\u274C No tienes permisos para usar este comando.",
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const message = await this.getPingStatus.execute();
    await interaction.editReply({ content: message });
  }
};

// src/infrastructure/discord/commands/test-welcome.command.ts
import { SlashCommandBuilder as SlashCommandBuilder2, MessageFlags as MessageFlags2 } from "discord.js";
var TestWelcomeCommand = class {
  constructor(getWelcomeMessage, welcomeNotifier, configRepository) {
    this.getWelcomeMessage = getWelcomeMessage;
    this.welcomeNotifier = welcomeNotifier;
    this.configRepository = configRepository;
  }
  getWelcomeMessage;
  welcomeNotifier;
  configRepository;
  data = new SlashCommandBuilder2().setName("test-welcome").setDescription("Simula y prueba el mensaje de bienvenida en este canal.");
  async execute(interaction) {
    const allowedUsers = this.configRepository.getDeveloperUserIds();
    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: "\u274C No tienes permisos para usar este comando.",
        flags: [MessageFlags2.Ephemeral]
      });
      return;
    }
    await interaction.deferReply({ flags: [MessageFlags2.Ephemeral] });
    if (!interaction.guildId) {
      await interaction.editReply({ content: "\u274C Este comando solo puede ser ejecutado dentro de un servidor." });
      return;
    }
    try {
      const welcomeMessage = await this.getWelcomeMessage.execute(interaction.user.toString());
      await this.welcomeNotifier.sendWelcome(
        interaction.guildId,
        interaction.channelId,
        interaction.user.id,
        welcomeMessage
      );
      await interaction.editReply({ content: "\u2705 Mensaje de prueba enviado al canal." });
    } catch (error) {
      await interaction.editReply({
        content: `\u274C Error al simular bienvenida: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
};

// src/infrastructure/discord/commands/setup-roles.command.ts
import {
  SlashCommandBuilder as SlashCommandBuilder3,
  EmbedBuilder as EmbedBuilder2,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags as MessageFlags3
} from "discord.js";
var SetupRolesCommand = class {
  constructor(configRepository) {
    this.configRepository = configRepository;
  }
  configRepository;
  data = new SlashCommandBuilder3().setName("setup-roles").setDescription("Despliega un panel de autogesti\xF3n de roles.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addStringOption(
    (option) => option.setName("seccion").setDescription("La secci\xF3n de configuraci\xF3n que deseas desplegar").setRequired(true).addChoices(
      { name: "Preferencias de Partida", value: "partidas" }
    )
  );
  async execute(interaction) {
    const allowedUsers = this.configRepository.getDeveloperUserIds();
    if (!allowedUsers.includes(interaction.user.id)) {
      await interaction.reply({
        content: "\u274C No tienes permisos para usar este comando.",
        flags: [MessageFlags3.Ephemeral]
      });
      return;
    }
    const seccion = interaction.options.getString("seccion", true);
    if (seccion === "partidas") {
      const mapping = this.configRepository.getPartidasRoleMapping();
      if (!mapping || Object.keys(mapping).length === 0) {
        await interaction.reply({
          content: "\u274C Error: No hay roles configurados para la secci\xF3n de partidas en el repositorio de configuraci\xF3n.",
          ephemeral: true
        });
        return;
      }
      const embed = new EmbedBuilder2().setColor("#1F618D").setTitle("\u{1F3AE} Preferencias de Partida").setDescription(
        "Selecciona los tipos de juego en los que participas habitualmente para recibir tus roles correspondientes:\n\n\u{1F3C6} **Rankeds / Clasificatorias:** Si buscas tryhardear y subir el elo.\n\u{1F37B} **Normales / Chill:** Partidas casuales en la Grieta del Invocador.\n\u{1F9CA} **ARAMs:** Diversi\xF3n r\xE1pida y ca\xF3tica en el Abismo de los Lamentos.\n\u{1F525} **Torneos / Eventos:** Mantente al tanto de las inscripciones y ligas internas."
      );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("role_pref:partidas:rankeds").setLabel("Rankeds").setEmoji("\u{1F3C6}").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("role_pref:partidas:normales").setLabel("Normales").setEmoji("\u{1F37B}").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("role_pref:partidas:arams").setLabel("ARAMs").setEmoji("\u{1F9CA}").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("role_pref:partidas:torneos").setLabel("Torneos").setEmoji("\u{1F525}").setStyle(ButtonStyle.Danger)
      );
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
};

// src/infrastructure/discord/events/guild-member-add.event.ts
import { Events } from "discord.js";
var GuildMemberAddEvent = class {
  constructor(handleNewMember) {
    this.handleNewMember = handleNewMember;
  }
  handleNewMember;
  name = Events.GuildMemberAdd;
  async execute(member) {
    const guildId = member.guild.id;
    const memberId = member.id;
    const username = member.user.toString();
    const memberTag = member.user.tag;
    await this.handleNewMember.execute(guildId, memberId, username, memberTag);
  }
};

// src/infrastructure/discord/events/interaction-create.event.ts
import { Events as Events2, MessageFlags as MessageFlags4 } from "discord.js";
var InteractionCreateEvent = class {
  constructor(commandsMap, toggleMemberRolePreference) {
    this.commandsMap = commandsMap;
    this.toggleMemberRolePreference = toggleMemberRolePreference;
  }
  commandsMap;
  toggleMemberRolePreference;
  name = Events2.InteractionCreate;
  async execute(interaction) {
    if (interaction.isButton()) {
      await this.handleButtonInteraction(interaction);
      return;
    }
    if (interaction.isChatInputCommand()) {
      await this.handleChatInputCommand(interaction);
      return;
    }
  }
  /**
   * Manejador para la asignación/remoción de roles mediante botones delegando en el Caso de Uso
   */
  async handleButtonInteraction(interaction) {
    const { customId, member, guildId } = interaction;
    if (!customId.startsWith("role_pref:")) return;
    await interaction.deferReply({ flags: [MessageFlags4.Ephemeral] });
    const parts = customId.split(":");
    const seccion = parts[1];
    const roleKey = parts[2];
    const memberId = member?.id;
    if (!guildId || !memberId) {
      await interaction.editReply({ content: "\u274C La interacci\xF3n no es v\xE1lida para este servidor o miembro." });
      return;
    }
    try {
      const result = await this.toggleMemberRolePreference.execute(guildId, memberId, seccion, roleKey);
      if (result.action === "added") {
        await interaction.editReply({
          content: `\u2705 \xA1Asignado con \xE9xito! Ahora tienes acceso a **${result.roleName}**.`
        });
      } else {
        await interaction.editReply({
          content: `\u2705 Se ha retirado tu rol de **${result.roleName}** correctamente.`
        });
      }
    } catch (error) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: `\u274C ${error instanceof Error ? error.message : "Hubo un error de comunicaci\xF3n interna al modificar tus roles."}`
        });
      }
    }
  }
  /**
   * Manejador para ejecutar los comandos del Chat (/ping, /setup-roles, etc.)
   */
  async handleChatInputCommand(interaction) {
    const command = this.commandsMap.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error ejecutando el comando /${interaction.commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Hubo un error al ejecutar este comando.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Hubo un error al ejecutar este comando.", ephemeral: true });
      }
    }
  }
};

// src/container.ts
var container = createContainer({
  injectionMode: InjectionMode.CLASSIC
  // Resolves dependencies by constructor parameter names
});
container.register({
  // Core Adapters
  logger: asClass(ConsoleLogger).singleton(),
  configRepository: asClass(StaticConfigRepository).singleton(),
  roleService: asClass(DiscordRoleService).singleton(),
  welcomeNotifier: asClass(DiscordWelcomeNotifier).singleton(),
  discordNotifier: asClass(DiscordNotifier).singleton(),
  // Webhook Handlers
  defaultWebhookHandler: asClass(DefaultWebhookHandler).singleton(),
  githubWebhookHandler: asClass(GithubWebhookHandler).singleton(),
  stripeWebhookHandler: asClass(StripeWebhookHandler).singleton(),
  // Registry de Handlers
  webhookHandlerRegistry: asFunction((defaultWebhookHandler, githubWebhookHandler, stripeWebhookHandler) => {
    return new WebhookHandlerRegistry([
      defaultWebhookHandler,
      githubWebhookHandler,
      stripeWebhookHandler
    ]);
  }).singleton(),
  // Use Cases
  getPingStatus: asClass(GetPingStatusUseCase).singleton(),
  getWelcomeMessage: asClass(GetWelcomeMessageUseCase).singleton(),
  handleNewMember: asClass(HandleNewMemberUseCase).singleton(),
  toggleMemberRolePreference: asClass(ToggleMemberRolePreferenceUseCase).singleton(),
  processWebhook: asClass(ProcessWebhookUseCase).singleton(),
  // Servidor Web
  webhookController: asClass(WebhookController).singleton(),
  expressServer: asClass(ExpressServer).singleton(),
  // Comandos
  pingCommand: asClass(PingCommand).singleton(),
  testWelcomeCommand: asClass(TestWelcomeCommand).singleton(),
  setupRolesCommand: asClass(SetupRolesCommand).singleton(),
  // Eventos
  guildMemberAddEvent: asClass(GuildMemberAddEvent).singleton(),
  // Custom instantiation for InteractionCreateEvent to pass the commands map
  interactionCreateEvent: asFunction((toggleMemberRolePreference) => {
    return new InteractionCreateEvent(
      getRegisteredCommands(),
      toggleMemberRolePreference
    );
  }).singleton()
});
function getRegisteredCommands() {
  const commandsMap = /* @__PURE__ */ new Map();
  const commandKeys = [
    "pingCommand",
    "testWelcomeCommand",
    "setupRolesCommand"
  ];
  for (const key of commandKeys) {
    const command = container.resolve(key);
    commandsMap.set(command.data.name, command);
  }
  return commandsMap;
}
function getRegisteredEvents() {
  return [
    container.resolve("guildMemberAddEvent"),
    container.resolve("interactionCreateEvent")
  ];
}

// src/index.ts
if (!process.env.DISCORD_TOKEN) {
  console.error("\u274C Error: DISCORD_TOKEN no definido.");
  process.exit(1);
}
var client = new Client3({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});
container.register({
  discordClient: asValue(client)
});
for (const event of getRegisteredEvents()) {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
client.once(Events3.ClientReady, (readyClient) => {
  console.log(`\u{1F680} Bot listo y escuchando como: ${readyClient.user.tag}`);
});
var expressServer = container.resolve("expressServer");
expressServer.start();
client.login(process.env.DISCORD_TOKEN);
