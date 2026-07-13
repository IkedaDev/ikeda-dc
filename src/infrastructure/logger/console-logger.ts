import { ILogger } from '../../domain/ports/logger.interface';

export class ConsoleLogger implements ILogger {
  private formatMessage(level: string, colorCode: string, message: string): string {
    const timestamp = new Date().toISOString();
    const resetCode = '\x1b[0m';
    return `${colorCode}[${timestamp}] [${level}]${resetCode} ${message}`;
  }

  info(message: string, ...meta: any[]): void {
    console.log(this.formatMessage('INFO', '\x1b[36m', message), ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    console.warn(this.formatMessage('WARN', '\x1b[33m', message), ...meta);
  }

  error(message: string, error?: any, ...meta: any[]): void {
    console.error(this.formatMessage('ERROR', '\x1b[31m', message), ...meta);
    if (error) {
      console.error(error);
    }
  }

  debug(message: string, ...meta: any[]): void {
    console.debug(this.formatMessage('DEBUG', '\x1b[90m', message), ...meta);
  }
}
