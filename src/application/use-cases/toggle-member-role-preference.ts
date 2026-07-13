import { IConfigRepository } from '../../domain/ports/config-repository.interface';
import { IRoleService } from '../../domain/ports/role-service.interface';
import { ILogger } from '../../domain/ports/logger.interface';

export interface ToggleRoleResult {
  success: boolean;
  action: 'added' | 'removed';
  roleName: string;
}

export class ToggleMemberRolePreferenceUseCase {
  constructor(
    private configRepository: IConfigRepository,
    private roleService: IRoleService,
    private logger: ILogger
  ) {}

  async execute(guildId: string, memberId: string, section: string, roleKey: string): Promise<ToggleRoleResult> {
    this.logger.info(`ToggleMemberRolePreferenceUseCase: miembro ${memberId} solicita alternar rol para ${section}:${roleKey}`);

    let roleId: string | undefined;
    if (section === 'partidas') {
      const mapping = this.configRepository.getPartidasRoleMapping();
      roleId = mapping[roleKey];
    }

    if (!roleId) {
      this.logger.warn(`No se encontró configuración de rol para sección "${section}" y clave "${roleKey}"`);
      throw new Error('Configuración de rol no encontrada en el sistema.');
    }

    const hasRole = await this.roleService.hasRole(guildId, memberId, roleId);
    const roleName = await this.roleService.getRoleName(guildId, roleId);

    if (hasRole) {
      await this.roleService.removeRole(guildId, memberId, roleId);
      this.logger.info(`Rol "${roleName}" (${roleId}) removido del miembro ${memberId}`);
      return {
        success: true,
        action: 'removed',
        roleName,
      };
    } else {
      await this.roleService.assignRole(guildId, memberId, roleId);
      this.logger.info(`Rol "${roleName}" (${roleId}) asignado al miembro ${memberId}`);
      return {
        success: true,
        action: 'added',
        roleName,
      };
    }
  }
}
