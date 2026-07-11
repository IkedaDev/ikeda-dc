export class GetPingStatusUseCase {
  async execute(): Promise<string> {
    return '¡Pong! 🏓 El sistema está operacional.';
  }
}