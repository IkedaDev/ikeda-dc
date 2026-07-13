import { createContainer, asClass, InjectionMode, asFunction } from 'awilix';
import { Client } from 'discord.js';

// Ports
import { ILogger } from './domain/ports/logger.interface';
import { IConfigRepository } from './domain/ports/config-repository.interface';
import { IRoleService } from './domain/ports/role-service.interface';
import { IWelcomeNotifier } from './domain/ports/welcome-notifier.interface';

// Adapters
import { ConsoleLogger } from './infrastructure/logger/console-logger';
import { StaticConfigRepository } from './infrastructure/config/static-config.repository';
import { DiscordRoleService } from './infrastructure/discord/services/discord-role.service';
import { DiscordWelcomeNotifier } from './infrastructure/discord/services/discord-welcome-notifier';

// Use Cases
import { GetPingStatusUseCase } from './application/use-cases/get-ping-status';
import { GetWelcomeMessageUseCase } from './application/use-cases/get-welcome-message';
import { HandleNewMemberUseCase } from './application/use-cases/handle-new-member';
import { ToggleMemberRolePreferenceUseCase } from './application/use-cases/toggle-member-role-preference';

// Commands
import { PingCommand } from './infrastructure/discord/commands/ping-command';
import { TestWelcomeCommand } from './infrastructure/discord/commands/test-welcome.command';
import { SetupRolesCommand } from './infrastructure/discord/commands/setup-roles.command';
import { Command } from './infrastructure/discord/interfaces/command';

// Events
import { GuildMemberAddEvent } from './infrastructure/discord/events/guild-member-add.event';
import { InteractionCreateEvent } from './infrastructure/discord/events/interaction-create.event';
import { Event } from './infrastructure/discord/interfaces/event';

export interface ICradle {
  // Core Ports & Adapters
  logger: ILogger;
  configRepository: IConfigRepository;
  roleService: IRoleService;
  welcomeNotifier: IWelcomeNotifier;

  // Use Cases
  getPingStatus: GetPingStatusUseCase;
  getWelcomeMessage: GetWelcomeMessageUseCase;
  handleNewMember: HandleNewMemberUseCase;
  toggleMemberRolePreference: ToggleMemberRolePreferenceUseCase;

  // Commands
  pingCommand: PingCommand;
  testWelcomeCommand: TestWelcomeCommand;
  setupRolesCommand: SetupRolesCommand;

  // Events
  guildMemberAddEvent: GuildMemberAddEvent;
  interactionCreateEvent: InteractionCreateEvent;

  // External dependency registered dynamically
  discordClient: Client;
}

const container = createContainer<ICradle>({
  injectionMode: InjectionMode.CLASSIC // Resolves dependencies by constructor parameter names
});

// Registar todo en el contenedor
container.register({
  // Core Adapters
  logger: asClass(ConsoleLogger).singleton(),
  configRepository: asClass(StaticConfigRepository).singleton(),
  roleService: asClass(DiscordRoleService).singleton(),
  welcomeNotifier: asClass(DiscordWelcomeNotifier).singleton(),

  // Use Cases
  getPingStatus: asClass(GetPingStatusUseCase).singleton(),
  getWelcomeMessage: asClass(GetWelcomeMessageUseCase).singleton(),
  handleNewMember: asClass(HandleNewMemberUseCase).singleton(),
  toggleMemberRolePreference: asClass(ToggleMemberRolePreferenceUseCase).singleton(),

  // Comandos
  pingCommand: asClass(PingCommand).singleton(),
  testWelcomeCommand: asClass(TestWelcomeCommand).singleton(),
  setupRolesCommand: asClass(SetupRolesCommand).singleton(),

  // Eventos
  guildMemberAddEvent: asClass(GuildMemberAddEvent).singleton(),
  
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
    container.resolve<Event>('interactionCreateEvent' as any)
  ];
}