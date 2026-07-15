import { createContainer, asClass, InjectionMode, asFunction } from 'awilix';
import { Client } from 'discord.js';

// Ports
import { ILogger } from './domain/ports/logger.interface';
import { IConfigRepository } from './domain/ports/config-repository.interface';
import { IRoleService } from './domain/ports/role-service.interface';
import { IWelcomeNotifier } from './domain/ports/welcome-notifier.interface';
import { IDiscordNotifier } from './domain/ports/discord-notifier.interface';
import { IWebhookHandler } from './domain/ports/webhook-handler.interface';

// Adapters
import { ConsoleLogger } from './infrastructure/logger/console-logger';
import { StaticConfigRepository } from './infrastructure/config/static-config.repository';
import { DiscordRoleService } from './infrastructure/discord/services/discord-role.service';
import { DiscordWelcomeNotifier } from './infrastructure/discord/services/discord-welcome-notifier';
import { DiscordNotifier } from './infrastructure/discord/services/discord-notifier';
import { DefaultWebhookHandler } from './infrastructure/webhooks/handlers/default.webhook-handler';

// Webhook Registry
import { WebhookHandlerRegistry } from './application/webhook-handler-registry';

// Use Cases
import { GetPingStatusUseCase } from './application/use-cases/get-ping-status';
import { GetWelcomeMessageUseCase } from './application/use-cases/get-welcome-message';
import { HandleNewMemberUseCase } from './application/use-cases/handle-new-member';
import { ToggleMemberRolePreferenceUseCase } from './application/use-cases/toggle-member-role-preference';
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook';

// Express Controller & Server
import { WebhookController } from './infrastructure/http/controllers/webhook.controller';
import { ExpressServer } from './infrastructure/http/server';

// Commands
import { PingCommand } from './infrastructure/discord/commands/ping-command';
import { TestWelcomeCommand } from './infrastructure/discord/commands/test-welcome.command';
import { SetupRolesCommand } from './infrastructure/discord/commands/setup-roles.command';
import { RedesCommand } from './infrastructure/discord/commands/redes-command';
import { PerfilCommand } from './infrastructure/discord/commands/perfil.command';
import { Command } from './infrastructure/discord/interfaces/command';

// Riot Games Integration
import { IRiotService } from './domain/ports/riot-service.interface';
import { RiotService } from './infrastructure/riot/riot.service';
import { GetSummonerProfileUseCase } from './application/use-cases/get-summoner-profile.use-case';
import { GetLiveGameUseCase } from './application/use-cases/get-live-game.use-case';

// Events
import { GuildMemberAddEvent } from './infrastructure/discord/events/guild-member-add.event';
import { GuildMemberUpdateEvent } from './infrastructure/discord/events/guild-member-update.event';
import { InteractionCreateEvent } from './infrastructure/discord/events/interaction-create.event';
import { Event } from './infrastructure/discord/interfaces/event';

export interface ICradle {
  // Core Ports & Adapters
  logger: ILogger;
  configRepository: IConfigRepository;
  roleService: IRoleService;
  welcomeNotifier: IWelcomeNotifier;
  discordNotifier: IDiscordNotifier;

  // Webhook Handlers
  defaultWebhookHandler: IWebhookHandler;
  webhookHandlerRegistry: WebhookHandlerRegistry;

  // Use Cases
  getPingStatus: GetPingStatusUseCase;
  getWelcomeMessage: GetWelcomeMessageUseCase;
  handleNewMember: HandleNewMemberUseCase;
  toggleMemberRolePreference: ToggleMemberRolePreferenceUseCase;
  processWebhook: ProcessWebhookUseCase;

  // Web Server Infrastructure
  webhookController: WebhookController;
  expressServer: ExpressServer;

  // Commands
  pingCommand: PingCommand;
  testWelcomeCommand: TestWelcomeCommand;
  setupRolesCommand: SetupRolesCommand;
  redesCommand: RedesCommand;
  perfilCommand: PerfilCommand;

  // Riot Integration & Use Cases
  riotService: IRiotService;
  getSummonerProfile: GetSummonerProfileUseCase;
  getLiveGame: GetLiveGameUseCase;

  // Events
  guildMemberAddEvent: GuildMemberAddEvent;
  guildMemberUpdateEvent: GuildMemberUpdateEvent;
  interactionCreateEvent: InteractionCreateEvent;

  // External dependency registered dynamically
  discordClient: Client;
}

const container = createContainer<ICradle>({
  injectionMode: InjectionMode.CLASSIC // Resolves dependencies by constructor parameter names
});

// Registrar todo en el contenedor
container.register({
  // Core Adapters
  logger: asClass(ConsoleLogger).singleton(),
  configRepository: asClass(StaticConfigRepository).singleton(),
  roleService: asClass(DiscordRoleService).singleton(),
  welcomeNotifier: asClass(DiscordWelcomeNotifier).singleton(),
  discordNotifier: asClass(DiscordNotifier).singleton(),

  // Webhook Handlers
  defaultWebhookHandler: asClass(DefaultWebhookHandler).singleton(),

  // Registry de Handlers
  webhookHandlerRegistry: asFunction((
    defaultWebhookHandler: IWebhookHandler,
  ) => {
    return new WebhookHandlerRegistry([
      defaultWebhookHandler,
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
  redesCommand: asClass(RedesCommand).singleton(),
  perfilCommand: asClass(PerfilCommand).singleton(),

  // Riot Integration & Use Cases
  riotService: asClass(RiotService).singleton(),
  getSummonerProfile: asClass(GetSummonerProfileUseCase).singleton(),
  getLiveGame: asClass(GetLiveGameUseCase).singleton(),

  // Eventos
  guildMemberAddEvent: asClass(GuildMemberAddEvent).singleton(),
  guildMemberUpdateEvent: asClass(GuildMemberUpdateEvent).singleton(),
  
  // Custom instantiation for InteractionCreateEvent to pass the commands map
  interactionCreateEvent: asFunction((toggleMemberRolePreference: ToggleMemberRolePreferenceUseCase) => {
    return new InteractionCreateEvent(
      getRegisteredCommands(),
      toggleMemberRolePreference
    );
  }).singleton()
});

export { container };

export function getRegisteredCommands(): Map<string, Command> {
  const commandsMap = new Map<string, Command>();

  const commandKeys: Array<keyof ICradle> = [
    'pingCommand',
    'testWelcomeCommand',
    'setupRolesCommand',
    'redesCommand',
    'perfilCommand',
  ];

  for (const key of commandKeys) {
    const command = container.resolve<Command>(key as any);
    commandsMap.set(command.data.name, command);
  }

  return commandsMap;
}

/**
 * Helper para obtener todos los eventos registrados que el bot debe escuchar al arrancar
 */
export function getRegisteredEvents(): Event[] {
  return [
    container.resolve<Event>('guildMemberAddEvent' as any),
    container.resolve<Event>('interactionCreateEvent' as any),
    container.resolve<Event>('guildMemberUpdateEvent' as any)
  ];
}