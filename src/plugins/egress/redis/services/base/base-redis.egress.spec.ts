import {NotImplementedException} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {Config} from 'src/common/interfaces/config.interface';
import {HTTPAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {BaseRedisEgress} from './base-redis.egress';

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

class RedisReadClientMock {}

class RedisWriteClientMock {}

const redisReadMock = {
  provide: 'RedisReadClient',
  useClass: RedisReadClientMock,
};

const redisWriteMock = {
  provide: 'RedisWriteClient',
  useClass: RedisWriteClientMock,
};

describe('BaseRedisOperator', () => {
  let baseRedisOperator: BaseRedisEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BaseRedisEgress,
        configFactory,
        redisWriteMock,
        redisReadMock,
      ],
    }).compile();
    baseRedisOperator = moduleRef.get<BaseRedisEgress>(BaseRedisEgress);
  });

  it('should to be defined', () => {
    expect(BaseRedisEgress).toBeDefined();
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
          flowKey: 'test-flow',
          payload: {},
        },
      };
      expect(async () => {
        await baseRedisOperator.operate(message);
      }).rejects.toThrowError(NotImplementedException);
    });
  });
});
