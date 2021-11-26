import {initTracerFromEnv, JaegerTracer, TracingOptions} from 'jaeger-client';
import {Tags, FORMAT_HTTP_HEADERS} from 'opentracing';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import {LoggerService} from '@nestjs/common';
import {upperCase} from 'lodash';

let logger: LoggerService | null = null;
if (process.env.NODE_ENV?.toLowerCase() !== 'production')
  logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error', 'warning'],
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike()
        ),
      }),
    ],
  });

const log = (level: string, context: string, data: any) => {
  if (!logger) return;
  level === 'error'
    ? logger.error(data, data.stack, context)
    : logger.log(data, context);
};

export let tracer: JaegerTracer;

export const initJaegerTracer = () => {
  const tracingOptions: TracingOptions = {};

  if (process.env.JAEGER_LOG === 'true') {
    tracingOptions.logger = console;
  }

  tracer = initTracerFromEnv({}, tracingOptions);
};

export const Trace = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    //redefine descriptor value within own function block
    descriptor.value = async function (...args: any[]) {
      let span;
      const parentContext = tracer.extract(
        FORMAT_HTTP_HEADERS,
        args[0].parentCtx
      );
      const spanName = upperCase(propertyKey).replace(' ', '_');
      if (!parentContext) {
        span = tracer.startSpan(spanName);
      } else {
        span = tracer.startSpan(spanName, {
          childOf: parentContext,
        });
      }
      span.setTag('inputData', {...args});
      span.setTag('contextId', args[0].contextId);
      span.setTag('functionName', spanName);
      args[0].ctx = {};
      tracer.inject(span, FORMAT_HTTP_HEADERS, args[0].ctx);
      let result;
      try {
        //attach original method implementation
        log('info', propertyKey, args);
        result = await originalMethod.apply(this, args);
        span.setTag('resultData', result);
        span.finish();
        return result;
      } catch (error) {
        log('error', propertyKey, error);
        span.setTag(Tags.ERROR, true);
        span.setTag('errorMessage', error);
        span.finish();
        return {
          error: {
            ...error,
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        };
      }
    };
    return descriptor;
  };
};
