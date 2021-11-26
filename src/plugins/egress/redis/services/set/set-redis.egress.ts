import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {RedisSetAction} from 'src/core/interfaces/egress-action.interface';
import {
  EgressPluginInputInterface,
  EgressPluginResultInterface,
} from 'src/core/interfaces/egress.interface';

import {BaseRedisEgress} from '../base/base-redis.egress';

@Injectable()
export class RedisSetEgress extends BaseRedisEgress {
  async operate({
    action,
    message,
  }: EgressPluginInputInterface): Promise<EgressPluginResultInterface> {
    const redisAction = action as RedisSetAction;
    try {
      if (redisAction.value && redisAction.valueFrom) {
        throw new Error('No value specified');
      }
      if (!redisAction.value && !redisAction.valueFrom) {
        throw new Error('2 values specified');
      }

      if (redisAction.value) {
        this.writeClient.set(
          redisAction.key,
          JSON.stringify(redisAction.value)
        );
        return {data: {}};
      }

      const payloadValue = get(message, redisAction.valueFrom!);
      if (!payloadValue) {
        throw new Error("value doesn't exists");
      }
      this.writeClient.set(
        redisAction.key,
        JSON.stringify({value: payloadValue})
      );
      return {data: {}};
    } catch (error) {
      return {data: {}, error};
    }
  }
}
