import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import fluentLogger from 'fluent-logger';

let counter = 0;

function bootstrapLogger() {
  let config;

  if (process.env.NODE_ENV?.toLowerCase() !== 'production') {
    config = {
      transports: [
        new winston.transports.Console({
          debugStdout: false,
          stderrLevels: ['error', 'warning'],
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike()
          ),
        }),
      ],
    };
  } else {
    const format = winston.format((info, opts) => {
      try {
        counter++;
      } catch (err) {
        counter = 0;
      }
      return {
        ...info,
        service: opts.service,
        host: opts.host,
        counter,
      };
    });

    config = {
      transports: [
        new winston.transports.Console({
          debugStdout: false,
          stderrLevels: ['error', 'warning'],
          format: winston.format.combine(
            winston.format.timestamp(),
            format({
              service: process.env.SERVICE_NAME,
              host: process.env.HOSTNAME || 'NOT_DEFINED',
            }),
            winston.format.json()
          ),
        }),
      ],
    };
  }

  const logger = WinstonModule.createLogger(config);
  return logger;
}

export {bootstrapLogger};
