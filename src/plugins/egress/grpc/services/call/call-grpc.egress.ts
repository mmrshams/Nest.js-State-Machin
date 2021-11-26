import * as grpc from '@grpc/grpc-js';
import {ServiceClientConstructor} from '@grpc/grpc-js/build/src/make-client';
import {Inject, Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {GrpcAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';
import {EgressPluginInterface} from 'src/plugins/interfaces/egress-plugin.interface';

@Injectable()
export class CallGrpcEgress implements EgressPluginInterface {
  constructor(
    @Inject('GrpcClientServices')
    protected readonly services: Record<string, Record<string, unknown>>
  ) {}

  async operate({
    message,
    action,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const grpcAction = action as GrpcAction;

    const serviceNameSegments = grpcAction.method.split('.');
    const methodName = serviceNameSegments.pop();
    const serviceName = serviceNameSegments.join('.');
    const constructor = this.services[serviceName]
      .constructor as ServiceClientConstructor;
    const isRequestStream = this.services[serviceName].requestSteam;
    const isResponseStream = this.services[serviceName].responseSteam;
    const client = new constructor(
      grpcAction.uri,
      grpcAction.options && grpcAction.options.isSecure
        ? grpc.credentials.createSsl()
        : grpc.credentials.createInsecure()
    );

    const grpcMethod = client[methodName!];
    const grpcData = get(message, grpcAction.dataKey);

    if (isRequestStream && isResponseStream) {
      return {data: {}};
    } else if (!isRequestStream && isResponseStream) {
      return new Promise<EgressPluginResultInterface>((resolve, reject) => {
        const call = grpcMethod.apply(grpcMethod, grpcData);
        const result: Array<Record<string, unknown>> = [];
        call.on('data', (data: Record<string, unknown>) => {
          result.push(data);
        });
        call.on('end', () => {
          resolve({data: result});
        });
        call.on('error', (error: Error) => {
          resolve({data: result, error});
        });
        call.on('state', () => {});
      });
    } else if (isRequestStream && !isResponseStream) {
      return {data: {}};
    } else {
      return new Promise<EgressPluginResultInterface>((resolve, reject) => {
        grpcMethod.apply(grpcMethod, [
          grpcData,
          (error: Error, data: Record<string, unknown>) => {
            if (error) {
              resolve({data: {}, error});
            }
            resolve({data});
          },
        ]);
      });
    }
  }
}
