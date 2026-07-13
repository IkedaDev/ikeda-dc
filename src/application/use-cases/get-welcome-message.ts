import { WelcomeMessage } from '../../domain/entities/welcome-message';
import { IConfigRepository } from '../../domain/ports/config-repository.interface';
import { ILogger } from '../../domain/ports/logger.interface';

export class GetWelcomeMessageUseCase {
  constructor(
    private configRepository: IConfigRepository,
    private logger: ILogger
  ) {}

  async execute(username: string): Promise<WelcomeMessage> {
    const templates = this.configRepository.getWelcomeTemplates();
    
    if (templates.length === 0) {
      this.logger.warn('No hay plantillas de bienvenida configuradas.');
      return new WelcomeMessage({
        title: '¡Bienvenido!',
        description: `Hola ${username}, ¡bienvenido al servidor!`,
        color: '#3498DB',
        image: '',
      });
    }

    const randomIndex = Math.floor(Math.random() * templates.length);
    const selected = templates[randomIndex];
    
    this.logger.info(`Plantilla de bienvenida seleccionada: "${selected.title}" para el usuario: ${username}`);

    return new WelcomeMessage({
      title: selected.title,
      description: selected.template.replace('{user}', username),
      color: selected.color,
      image: selected.image,
    });
  }
}