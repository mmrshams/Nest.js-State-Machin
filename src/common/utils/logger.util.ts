import {
  Inject,
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';

interface winstonLog {
  level: 'error' | 'warn' | 'log' | 'debug' | 'verbose';
  context?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class LoggerService {
  constructor(@Inject(Logger) private readonly logger: NestLoggerService) {}

  async log(logInfo: winstonLog): Promise<void> {
    const {level, data, context} = logInfo;

    if (level !== 'error') return this.logger[level]?.(data, context);

    this.logger.error(data, '', context);
  }
}
