import {NotImplementedException} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {Config} from 'src/common/interfaces/config.interface';
import {HTTPAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {BaseMongodbEgress} from './base-mongodb.egress';

const configFactory = {
  provide: 'Config',
  useFactory: async () => {
    const config = new Config({
      FLOWS_PATH: 'src/flows',
      PWD: process.env['PWD'],
    });
    return config;
  },
};

class MongoClientMock {}

const mongodbMock = {
  provide: 'MongodbClient',
  useClass: MongoClientMock,
};

describe('BaseMongoOperator', () => {
  let baseMongoOperator: BaseMongodbEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BaseMongodbEgress, configFactory, mongodbMock],
    }).compile();
    baseMongoOperator = moduleRef.get<BaseMongodbEgress>(BaseMongodbEgress);
  });

  it('should to be defined', () => {
    expect(baseMongoOperator).toBeDefined();
  });

  describe('operate', () => {
    it('should throw not implemented', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          bodyTemplate: 'notfound.mustache',
          headerTemplate: 'testFlow.http.header.mustache',
          urlTemplate: 'testFlow.http.url.mustache',
          parseAs: 'JSON',
          generateAs: 'JSON',
          requestMethod: 'GET',
          logRawResponse: false,
        } as HTTPAction,
        message: {
          flowKey: 'flow-key',
          payload: {},
        },
      };
      expect(async () => {
        await baseMongoOperator.operate(message);
      }).rejects.toThrowError(NotImplementedException);
    });
  });
});
