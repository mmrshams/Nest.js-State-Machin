import * as grpc from '@grpc/grpc-js';
import {Inject, Injectable, Logger, LoggerService} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {get, merge, snakeCase, upperCase} from 'lodash';
import {Messages} from 'src/common/enums/messages.enum';
import {Config} from 'src/common/interfaces/config.interface';
import {v4 as uuidv4} from 'uuid';
import {
  IngressPluginInputInterface,
  IngressPluginResultInterface,
} from 'src/core/interfaces/ingress.interface';
import {IngressPluginInterface} from 'src/plugins/interfaces/ingress-plugin.interface';
import {tracer} from 'src/common/decorators/tracer.decorator';
import {FORMAT_HTTP_HEADERS, Tags} from 'opentracing';

@Injectable()
export class ListenGrpcIngress implements IngressPluginInterface {
  constructor(
    @Inject('GrpcServiceDefinition')
    protected readonly services: Record<string, Record<string, unknown>>,
    @Inject('VenomProxy')
    protected readonly clientProxy: ClientProxy,
    @Inject('Config')
    protected readonly config: Config,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async listen(
    message: IngressPluginInputInterface
  ): Promise<IngressPluginResultInterface> {
    const {flows} = message;

    const server = new grpc.Server();
    // TODO[refactore]: decompose grpc to separate ingress plugins
    // TODO[refactore]: class composition
    for (const [key, service] of Object.entries(this.services)) {
      const callbacks: Record<string, Function> = {};
      const constructor = (service.constructor as unknown) as grpc.ServiceDefinition;
      for (const [methodName, method] of Object.entries(constructor)) {
        const isRequestStream = method.requestStream;
        const isResponseStream = method.responseStream;
        const flow = flows.find(flow => {
          const flowGrpcConfig = flow.ingress?.grpc;
          return (
            `${key}.${methodName}` ===
            `${flowGrpcConfig?.package}.${flowGrpcConfig?.service}.${flowGrpcConfig?.method}`
          );
        });
        if (isRequestStream && isResponseStream) {
          callbacks[`${method.originalName}`] = (
            call: grpc.ServerWritableStream<unknown, unknown>
          ) => {
            call.on('data', (data: unknown) => {
              const {
                contextId,
                parentCtx,
                span,
                correlationId,
              } = this.startTrace(method.originalName, call.metadata);
              const result = this.clientProxy.send(Messages.START_MAIN_FLOW, {
                contextId,
                parentCtx,
                flowKey: flow?.key,
                payload: data,
                correlationId,
              });
              result.subscribe({
                next: flowResult => {
                  if (flowResult.error)
                    return call.emit(
                      'error',
                      this.handleError(flowResult.error, contextId)
                    );

                  const result = get(flowResult, flow!.ingress!.grpc!.key!);
                  return call.write(result);
                },
                error: err => {
                  span.setTag(Tags.ERROR, true);
                  span.setTag('errorMessage', err);
                  span.finish();
                  call.emit('error', this.handleError(err, contextId));
                },
                complete: () => {
                  span.finish();
                  call.end();
                },
              });
            });
            call.on('end', () => {});
          };
        } else if (!isRequestStream && isResponseStream) {
          callbacks[`${method.originalName}`] = (
            call: grpc.ServerWritableStream<unknown, unknown>
          ) => {
            const {contextId, parentCtx, span, correlationId} = this.startTrace(
              method.originalName,
              call.metadata
            );
            const result = this.clientProxy.send(Messages.START_MAIN_FLOW, {
              contextId,
              parentCtx,
              flowKey: flow?.key,
              payload: call.request,
              correlationId,
            });
            result.subscribe({
              next: flowResult => {
                if (flowResult.error) {
                  call.emit(
                    'error',
                    this.handleError(flowResult.error, contextId)
                  );
                  call.end();
                  return;
                }
                call.metadata;
                flowResult = merge({}, ...flowResult);
                const result = get(flowResult, flow!.ingress!.grpc!.key!);
                if (!result) {
                  return;
                }

                (result as unknown[]).forEach(r => {
                  call.write(r);
                });
              },
              error: err => {
                span.setTag(Tags.ERROR, true);
                span.setTag('errorMessage', err);
                span.finish();
                call.emit('error', this.handleError(err, contextId));
                call.end();
              },
              complete: () => {
                span.finish();
                call.end();
              },
            });
          };
        } else if (isRequestStream && !isResponseStream) {
          // callbacks[`${method.originalName}`] = (call: any, callback: any) => {
          //   call.on('data', (data: unknown) => {
          //     const result = this.clientProxy.send(Messages.START_MAIN_FLOW, {
          //       payload: data,
          //     });
          //     result.subscribe({
          //       next(x) {
          //       },
          //       error(err) {
          //         console.error('something wrong occurred: ' + err);
          //       },
          //       complete() {
          //       },
          //     });
          //   });
          //   call.on('end', () => {
          //   });
          // };
        } else {
          // unary to unary
          callbacks[`${method.originalName}`] = (
            call: grpc.ServerUnaryCall<unknown, unknown>,
            callback: grpc.sendUnaryData<unknown>
          ) => {
            const {contextId, parentCtx, span, correlationId} = this.startTrace(
              method.originalName,
              call.metadata
            );
            const result = this.clientProxy.send(Messages.START_MAIN_FLOW, {
              contextId,
              parentCtx,
              flowKey: flow?.key,
              payload: call.request,
              correlationId,
            });
            result.subscribe({
              next: flowResult => {
                if (flowResult.error) {
                  return callback(
                    this.handleError(flowResult.error, contextId)
                  );
                }

                if (!(flowResult instanceof Array)) {
                  flowResult = [flowResult];
                }

                flowResult = merge({}, ...flowResult);
                const result = get(flowResult, flow!.ingress!.grpc!.key!);
                callback(null, result);
              },
              error: err => {
                span.setTag(Tags.ERROR, true);
                span.setTag('errorMessage', err);
                span.finish();
                callback(this.handleError(err, contextId));
              },
              complete: () => {
                span.finish();
              },
            });
          };
        }
      }
      server.addService(
        constructor as grpc.ServiceDefinition,
        callbacks as grpc.UntypedServiceImplementation
      );
    }

    server.bindAsync(
      this.config!.GRPC_URI!,
      grpc.ServerCredentials.createInsecure(),
      () => {
        server.start();
      }
    );
    return {};
  }

  handleError(error: any, contextId: string) {
    this.logger.error(
      {...error, contextId},
      error.stack,
      'IngressErrorHandler'
    );

    if (error.name === 'TRANSFORM_ERROR') {
      return {
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message,
      };
    }

    if (error.name === 'EGRESS_ERROR') {
      return {
        code: grpc.status.UNAVAILABLE,
        message: `${error.name} - ${error.message}`,
      };
    }

    return {
      code: grpc.status.INTERNAL,
      message: 'Internal Error',
    };
  }

  startTrace(methodName: string | undefined, metadata: grpc.Metadata) {
    const contextId = uuidv4();
    const name = upperCase(methodName || 'UNKNOWN INGRESS METHOD').replace(
      ' ',
      '_'
    );
    const span = tracer.startSpan(name);
    span.setTag('contextId', contextId);
    const correlationId = metadata.get('x-correlation-id');
    if (correlationId) {
      const id = correlationId.length === 1 ? correlationId[0] : correlationId;
      span.setTag('correlationId', id);
    }
    const parentCtx = {};
    tracer.inject(span, FORMAT_HTTP_HEADERS, parentCtx);

    this.logger.log({contextId, correlationId, method: name}, 'GrpcIngress');

    return {contextId, span, parentCtx, correlationId};
  }
}
