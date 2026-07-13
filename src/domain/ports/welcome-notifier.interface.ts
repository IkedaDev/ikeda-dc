import { WelcomeMessage } from '../entities/welcome-message';

export interface IWelcomeNotifier {
  sendWelcome(guildId: string, channelId: string, memberId: string, message: WelcomeMessage): Promise<void>;
}
