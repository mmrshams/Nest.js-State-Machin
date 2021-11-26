import * as grpc from '@grpc/grpc-js';
import {ServiceClientConstructor} from '@grpc/grpc-js/build/src/make-client';
import * as protoLoader from '@grpc/proto-loader';
import {Logger} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as fs from 'fs';
import {get} from 'lodash';
import {Observable} from 'rxjs';
import {Config} from 'src/common/interfaces/config.interface';

import {ListenGrpcIngress} from './listen-grpc.ingress';

const grpcServicesFactory = {
  provide: 'GrpcServiceDefinition',
  useFactory: (): Record<string, Record<string, unknown>> => {
    const config = new Config({
      FLOWS_PATH: 'src/flows',
      PROTOS_PATH: 'protos',
      PWD: process.env['PWD'],
    });

    const protoPaths = fs.readdirSync(config.PROTOS_PATH);
    const grpcs: Array<string> = [];
    const services: Record<string, Record<string, unknown>> = {};

    for (const protoPath of protoPaths) {
      const packageDefinition = protoLoader.loadSync(
        `${config.PROTOS_PATH}/${protoPath}`
      );
      const packageObject = grpc.loadPackageDefinition(packageDefinition);

      Object.entries(packageDefinition).forEach(([messageName, message]) => {
        const messageKeys = Object.keys(message);
        if (!messageKeys.includes('format')) {
          return messageKeys.forEach(methodName => {
            grpcs.push(
              `${messageName}.${
                methodName.charAt(0).toLocaleLowerCase() + methodName.slice(1)
              }`
            );
          });
        }
      });

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
    }
    return services;
  },
};

class ClientProxyMock {
  send(pattern: string, simulation: unknown): unknown {
    return new Observable();
  }
}

const clientProxyMock = {
  provide: 'VenomProxy',
  useClass: ClientProxyMock,
};

const configFactory = {
  provide: 'Config',
  useFactory: async () => {
    const config = new Config({
      GRPC_URI: '0.0.0.0:5000',
      PWD: process.env['PWD'],
    });
    return config;
  },
};

describe('CallGrpcEgress', () => {
  let callGrpcEgress: ListenGrpcIngress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ListenGrpcIngress,
        configFactory,
        clientProxyMock,
        grpcServicesFactory,
        Logger,
      ],
    }).compile();
    callGrpcEgress = moduleRef.get<ListenGrpcIngress>(ListenGrpcIngress);
  });

  it('should to be defined', () => {
    expect(callGrpcEgress).toBeDefined();
  });
});
