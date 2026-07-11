// src/container.ts
import { createContainer, asClass, InjectionMode } from 'awilix';
import { PingCommand } from './infrastructure/discord/commands/ping-command';
import { Command } from './infrastructure/discord/interfaces/command';
import { GetPingStatusUseCase } from './application/use-cases/get-ping-status';
import { GetWelcomeMessageUseCase } from './application/use-cases/get-welcome-message';
import { TestWelcomeCommand } from './infrastructure/discord/commands/test-welcome.command';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC // Permite resolver dependencias por los nombres de los parámetros del constructor
});

// Registrar Casos de Uso y Comandos
container.register({
  getPingStatus: asClass(GetPingStatusUseCase).singleton(),
  getWelcomeMessage: asClass(GetWelcomeMessageUseCase).singleton(),
  pingCommand: asClass(PingCommand).singleton(),
  testWelcomeCommand: asClass(TestWelcomeCommand).singleton(),
});

export { container };

// Helper para agrupar los comandos de Discord de manera indexada
export function getRegisteredCommands(): Map<string, Command> {
  const commandsMap = new Map<string, Command>();


  const ping = container.resolve<Command>('pingCommand');
  const testWelcome = container.resolve<Command>('testWelcomeCommand');
  
  commandsMap.set(ping.data.name, ping);
  commandsMap.set(testWelcome.data.name, testWelcome);
  
  return commandsMap;
}