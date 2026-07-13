// src/container.ts
import { createContainer, asClass, InjectionMode, asFunction } from 'awilix';
import { PingCommand } from './infrastructure/discord/commands/ping-command';
import { Command } from './infrastructure/discord/interfaces/command';
import { GetPingStatusUseCase } from './application/use-cases/get-ping-status';
import { GetWelcomeMessageUseCase } from './application/use-cases/get-welcome-message';
import { TestWelcomeCommand } from './infrastructure/discord/commands/test-welcome.command';
import { SetupRolesCommand } from './infrastructure/discord/commands/setup-roles.command';
import { GuildMemberAddEvent } from './infrastructure/discord/events/guild-member-add.event';
import { InteractionCreateEvent } from './infrastructure/discord/events/interaction-create.event';
import { Event } from './infrastructure/discord/interfaces/event'

export interface ICradle {
  getPingStatus: GetPingStatusUseCase;
  getWelcomeMessage: GetWelcomeMessageUseCase;
  pingCommand: PingCommand;
  testWelcomeCommand: TestWelcomeCommand;
  setupRolesCommand: SetupRolesCommand;
  guildMemberAddEvent: GuildMemberAddEvent;
  interactionCreateEvent: InteractionCreateEvent;
}

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC // Permite resolver dependencias por los nombres de los parámetros del constructor
});

// Registrar Casos de Uso y Comandos
container.register({
  // Use Cases
  getPingStatus: asClass(GetPingStatusUseCase).singleton(),
  getWelcomeMessage: asClass(GetWelcomeMessageUseCase).singleton(),

  // Comandos
  pingCommand: asClass(PingCommand).singleton(),
  testWelcomeCommand: asClass(TestWelcomeCommand).singleton(),
  setupRolesCommand: asClass(SetupRolesCommand).singleton(),

  // Eventos
  guildMemberAddEvent: asClass(GuildMemberAddEvent).singleton(),
  
  // 🔥 SOLUCIÓN DEFINITIVA: Registramos usando asFunction para bypassar el escaneo automático
  // Instanciamos manualmente pasándole el helper getRegisteredCommands() al constructor de la clase
  interactionCreateEvent: asFunction(() => {
    return new InteractionCreateEvent(getRegisteredCommands());
  }).singleton()
});

export { container };
export function getRegisteredCommands(): Map<string, Command> {
  const commandsMap = new Map<string, Command>();

  // Gracias a la interfaz ICradle, ahora resolvemos con tipado estricto e Intellisense nativo
  const commandKeys: Array<keyof ICradle> = [
    'pingCommand',
    'testWelcomeCommand',
    'setupRolesCommand',
  ];

  for (const key of commandKeys) {
    const command = container.resolve<Command>(key);
    commandsMap.set(command.data.name, command);
  }

  return commandsMap;
}

/**
 * Helper para obtener todos los eventos registrados que el bot debe escuchar al arrancar
 */
export function getRegisteredEvents(): Event[] {
  return [
    container.resolve<Event>('guildMemberAddEvent'),
    container.resolve<Event>('interactionCreateEvent')
  ];
}