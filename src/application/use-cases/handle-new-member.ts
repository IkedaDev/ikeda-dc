import { IConfigRepository } from '../../domain/ports/config-repository.interface';
import { IRoleService } from '../../domain/ports/role-service.interface';
import { IWelcomeNotifier } from '../../domain/ports/welcome-notifier.interface';
import { ILogger } from '../../domain/ports/logger.interface';
import { GetWelcomeMessageUseCase } from './get-welcome-message';

export class HandleNewMemberUseCase {
  constructor(
    private configRepository: IConfigRepository,
    private roleService: IRoleService,
    private welcomeNotifier: IWelcomeNotifier,
    private getWelcomeMessage: GetWelcomeMessageUseCase,
    private logger: ILogger
  ) {}

  async execute(guildId: string, memberId: string, username: string, memberTag: string): Promise<void> {
    this.logger.info(`Iniciando flujo de nuevo miembro para ${memberTag} (${memberId}) en servidor ${guildId}`);

    // 1. Enviar mensaje de bienvenida
    try {
      const welcomeChannelId = this.configRepository.getWelcomeChannelId();
      const welcomeMessage = await this.getWelcomeMessage.execute(username);
      
      await this.welcomeNotifier.sendWelcome(guildId, welcomeChannelId, memberId, welcomeMessage);
      this.logger.info(`Mensaje de bienvenida enviado con éxito para ${memberTag}`);
    } catch (error) {
      this.logger.error(`Error al enviar mensaje de bienvenida para ${memberTag}:`, error);
    }

    // 2. Asignar roles por defecto
    try {
      const defaultRoleIds = this.configRepository.getDefaultRoleIds();
      if (defaultRoleIds.length > 0) {
        for (const roleId of defaultRoleIds) {
          await this.roleService.assignRole(guildId, memberId, roleId);
        }
        this.logger.info(`Roles por defecto (${defaultRoleIds.join(', ')}) asignados con éxito a ${memberTag}`);
      }
    } catch (error) {
      this.logger.error(`Error al asignar roles por defecto a ${memberTag}:`, error);
    }
  }
}
