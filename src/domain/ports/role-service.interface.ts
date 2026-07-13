export interface IRoleService {
  assignRole(guildId: string, memberId: string, roleId: string): Promise<void>;
  removeRole(guildId: string, memberId: string, roleId: string): Promise<void>;
  hasRole(guildId: string, memberId: string, roleId: string): Promise<boolean>;
  getRoleName(guildId: string, roleId: string): Promise<string>;
}
