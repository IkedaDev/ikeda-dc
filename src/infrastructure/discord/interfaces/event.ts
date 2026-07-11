import { ClientEvents, Events } from 'discord.js';

export interface Event {
  name: Events | keyof ClientEvents;
  once?: boolean;
  execute(...args: any[]): Promise<void>;
}