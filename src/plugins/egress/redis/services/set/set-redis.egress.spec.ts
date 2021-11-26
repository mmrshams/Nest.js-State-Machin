import {Test} from '@nestjs/testing';
import {KeyType, Ok, ValueType} from 'ioredis';
import {Config} from 'src/common/interfaces/config.interface';
import {RedisSetAction} from 'src/core/interfaces/egress-action.interface';
import {EgressPluginInputInterface} from 'src/core/interfaces/egress.interface';

import {RedisSetEgress} from './set-redis.egress';

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

describe('RedisSetOperator', () => {
  let redisSetOperator: RedisSetEgress;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RedisSetEgress, configFactory, redisReadMock, redisWriteMock],
    }).compile();
    redisSetOperator = moduleRef.get<RedisSetEgress>(RedisSetEgress);
  });

  it('should to be defined', () => {
    expect(RedisSetEgress).toBeDefined();
  });

  describe('operate', () => {
    it('should return error if no values are specified', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
        } as RedisSetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisSetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });

    it('should return error if 2 values are specified', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
          value: '123',
          valueFrom: 'key',
        } as RedisSetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisSetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });

    it('should return error if valueKey has no value in payload', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
          valueFrom: 'Inputs.age',
        } as RedisSetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisSetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeDefined();
    });

    it('should return Ok if valueKey has value in payload', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
          valueFrom: 'payload.age',
        } as RedisSetAction,
        message: {
          flowKey: 'test',
          payload: {
            age: 12,
          },
        },
      };
      const {data, error} = await redisSetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeUndefined();
    });

    it('should return Ok if value is provided', async () => {
      const message: EgressPluginInputInterface = {
        action: {
          key: 'token',
          value: '123',
        } as RedisSetAction,
        message: {
          flowKey: 'test',
          payload: {},
        },
      };
      const {data, error} = await redisSetOperator.operate(message);
      expect(data).toEqual({});
      expect(error).toBeUndefined();
    });
  });
});
