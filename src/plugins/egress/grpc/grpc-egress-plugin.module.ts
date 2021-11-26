import * as grpc from '@grpc/grpc-js';
import {ServiceClientConstructor} from '@grpc/grpc-js/build/src/make-client';
import * as protoLoader from '@grpc/proto-loader';
import {DynamicModule, Module} from '@nestjs/common';
import * as fs from 'fs';
import {get} from 'lodash';
import {Config} from 'src/common/interfaces/config.interface';

import {CallGrpcEgress} from './services/call/call-grpc.egress';

@Module({})
export class GrpcPluginModule {
  static register(config: Config): DynamicModule {
    const grpcServicesFactory = {
      provide: 'GrpcClientServices',
      useFactory: (): Record<string, Record<string, unknown>> => {
        const protoDirs = config.PROTOS_PATH.split(',');
        const grpcs: Array<string> = [];
        const services: Record<string, Record<string, unknown>> = {};
        protoDirs.forEach(protoDir => {
          const protoPaths = fs.readdirSync(protoDir);
          protoPaths.forEach(protoPath => {
            const packageDefinition = protoLoader.loadSync(
              `${config.PROTOS_PATH}/${protoPath}`,
              {
                includeDirs: config.PROTO_IMPORT_PATH.split(','),
                defaults: config.GRPC_SET_DEFAULT_VALUES,
              }
            );
            const packageObject = grpc.loadPackageDefinition(packageDefinition);

            Object.entries(packageDefinition).forEach(
              ([messageName, message]) => {
                const messageKeys = Object.keys(message);
                if (!messageKeys.includes('format')) {
                  return messageKeys.forEach(methodName => {
                    grpcs.push(
                      `${messageName}.${
                        methodName.charAt(0).toLocaleLowerCase() +
                        methodName.slice(1)
                      }`
                    );
                  });
                }
              }
            );

            grpcs
              .filter((v, i, a) => a.indexOf(v) === i)
              .forEach(grpc => {
                const nameSegments = grpc.split('.');
                const methodName = nameSegments.pop();
                const serviceName = nameSegments.join('.');
                services[serviceName] = {
                  requestStream: get(
                    packageDefinition[serviceName],
                    `${
                      methodName!.charAt(0).toUpperCase() + methodName!.slice(1)
                    }.requestStream`
                  ),
                  responseSteam: get(
                    packageDefinition[serviceName],
                    `${
                      methodName!.charAt(0).toUpperCase() + methodName!.slice(1)
                    }.responseStream`
                  ),
                  constructor: get(
                    packageObject,
                    serviceName
                  ) as ServiceClientConstructor,
                };
              });
          });
        });

        return services;
      },
    };

    return {
      module: GrpcPluginModule,
      providers: [grpcServicesFactory, CallGrpcEgress],
      exports: [CallGrpcEgress],
    };
  }
}
