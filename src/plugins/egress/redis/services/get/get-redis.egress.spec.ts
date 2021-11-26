import {Test} from '@nestjs/testing';
import {KeyType, Ok, ValueType} from 'ioredis';
import {Config} from 'src/common/interfaces/config.interface';
import {RedisGetAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {RedisGetEgress} from './get-redis.egress';

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

class RedisReadClientMock {
  async get(key: KeyType): Promise<string | null> {
    if (key === 'null') return null;
    if (key === 'error') return `{value: "${key.toString()}"}`;
    return `{"value": "${key.toString()}"}`;
  }
}

class RedisWriteClientMock {
  async set(
    key: KeyType,
    value: ValueType,
    expiryMode?: string | any[],
    time?: number | string,
    setMode?: number | string
  ): Promise<Ok | null> {
    return 'OK';
  }
}

const redisReadMock = {
  provide: 'RedisReadClient',
  useClass: RedisReadClientMock,
};

const redisWriteMock = {
  provide: 'RedisWriteClient',
  useClass: RedisWriteClientMock,
};

describe('RedisGetOperator', () => {
  let redisGetOperator: RedisGetEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RedisGetEgress, configFactory, redisReadMock, redisWriteMock],
    }).compile();
    redisGetOperator = moduleRef.get<RedisGetEgress>(RedisGetEgress);
  });

  it('should to be defined', () => {
    expect(redisGetOperator).toBeDefined();
  });

  describe('operate', () => {
    it('should return token on token key', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
        } as RedisGetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisGetOperator.operate(message);
      expect(data).toEqual('token');
      expect(error).toBeUndefined();
    });

    it('should  return empty on null key', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'null',
        } as RedisGetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisGetOperator.operate(message);
      expect(data).toEqual(undefined);
      expect(error).toBeUndefined();
    });

    it('should return error on error key', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'error',
        } as RedisGetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisGetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });
  });
});
