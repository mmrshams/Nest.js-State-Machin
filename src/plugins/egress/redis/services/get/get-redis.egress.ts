import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {RedisGetAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {BaseRedisEgress} from '../base/base-redis.egress';

@Injectable()
export class RedisGetEgress extends BaseRedisEgress {
  async operate({
    action,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const redisAction = action as RedisGetAction;
    try {
      const data = await this.readClient.get(redisAction.key);
      return {
        data: get(JSON.parse(data!), 'value'),
      };
    } catch (error) {
      return {data: {}, error};
    }
  }
}
