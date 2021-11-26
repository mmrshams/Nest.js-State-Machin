import * as grpc from '@grpc/grpc-js';
import {ServiceClientConstructor} from '@grpc/grpc-js/build/src/make-client';
import * as protoLoader from '@grpc/proto-loader';
import {Test} from '@nestjs/testing';
import * as fs from 'fs';
import {get} from 'lodash';
import {Config} from 'src/common/interfaces/config.interface';

import {CallGrpcEgress} from './call-grpc.egress';

const grpcServicesFactory = {
  provide: 'GrpcClientServices',
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

describe('CallGrpcEgress', () => {
  let callGrpcEgress: CallGrpcEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CallGrpcEgress, grpcServicesFactory],
    }).compile();
    callGrpcEgress = moduleRef.get<CallGrpcEgress>(CallGrpcEgress);
  });

  it('should to be defined', () => {
    expect(callGrpcEgress).toBeDefined();
  });

  describe('operate', () => {});
});
