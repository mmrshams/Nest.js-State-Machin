import {Inject, Injectable, NotImplementedException} from '@nestjs/common';
import {Redis} from 'ioredis';
import {Config} from 'src/common/interfaces/config.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {EgressPluginInterface} from '../../../../interfaces/egress-plugin.interface';

@Injectable()
export class BaseRedisEgress implements EgressPluginInterface {
  constructor(
    protected readonly config: Config,
    @Inject('RedisReadClient') protected readonly readClient: Redis,
    @Inject('RedisWriteClient') protected readonly writeClient: Redis
  ) {}

  async operate(
    message: EgressPluginInputInterface
  ): Promise<EgressPluginResultInterface> {
    throw new NotImplementedException();
  }
}
