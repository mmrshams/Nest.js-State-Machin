import {DynamicModule, Module} from '@nestjs/common';
import Redis from 'ioredis';
import {Config} from 'src/common/interfaces/config.interface';

@Module({})
export class RedisPluginModule {
  static register(config: Config): DynamicModule {
    return {
      module: RedisPluginModule,
      providers: [
        {
          provide: 'RedisReadClient',
          useFactory: async () => {
            const redisClient = new Redis(config.REDIS_READ_URI);
            return redisClient;
          },
        },
        {
          provide: 'RedisWriteClient',
          useFactory: async () => {
            const redisClient = new Redis(config.REDIS_WRITE_URI);
            return redisClient;
          },
        },
      ],
    };
  }
}
