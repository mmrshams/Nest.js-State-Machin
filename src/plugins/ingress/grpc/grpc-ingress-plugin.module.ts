import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {DynamicModule, Logger, Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {get} from 'lodash';
import {Config} from 'src/common/interfaces/config.interface';
import {ListenGrpcIngress} from './services/call/listen-grpc.ingress';
import * as fs from 'fs';
import * as path from 'path';

const readdirSync = (p: string, a: Array<string> = []) => {
  if (fs.statSync(p).isDirectory())
    fs.readdirSync(p).map(f => readdirSync(a[a.push(path.join(p, f)) - 1], a));
  return a;
};
@Module({})
export class GrpcIngressPluginModule {
  static register(config: Config): DynamicModule {
    const grpcServicesFactory = {
      provide: 'GrpcServiceDefinition',
      useFactory: async (): Promise<
        Record<string, Record<string, unknown>>
      > => {
        const protoDirs = config.PROTOS_PATH.split(',');
        const grpcs: Array<string> = [];
        const services: Record<string, Record<string, unknown>> = {};

        protoDirs.forEach(protoDir => {
          const protoPaths = readdirSync(protoDir).filter(path =>
            path.endsWith('.proto')
          );
          protoPaths.forEach(protoPath => {
            const packageDefinition = protoLoader.loadSync(protoPath, {
              includeDirs: config.PROTO_IMPORT_PATH.split(','),
              defaults: config.GRPC_SET_DEFAULT_VALUES,
            });
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
                nameSegments.pop(); // pop method name
                const serviceName = nameSegments.join('.');
                if (get(packageObject, `${serviceName}.service`)) {
                  services[serviceName] = {
                    constructor: (get(
                      packageObject,
                      `${serviceName}.service`
                    ) as unknown) as grpc.ServiceDefinition,
                  };
                }
              });
          });
        });
        return services;
      },
    };

    return {
      module: GrpcIngressPluginModule,
      imports: [
        ClientsModule.register([
          {
            name: 'VenomProxy',
            transport: Transport.TCP,
            options: {
              host: config.PROVIDER_TCP_URI.split(':')[0],
              port: parseInt(config.PROVIDER_TCP_URI.split(':')[1]),
            },
          },
        ]),
      ],
      providers: [
        grpcServicesFactory,
        ListenGrpcIngress,
        {provide: 'Config', useValue: config},
        Logger,
      ],
      exports: [ListenGrpcIngress],
    };
  }
}
