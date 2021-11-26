import {
  BaseGrpcAction,
  HTTPAction,
  BaseMongodbAction,
  BaseRedisAction,
  KafkaConsumerAction,
  KafkaProduceAction,
} from './egress-action.interface';
import {MessageInterface} from './message.interface';

export class EgressInterface {
  readonly flowKey!: string;

  readonly payload!: Record<string, unknown>;
}

export class EgressResultInterface {
  readonly payload!: Record<string, unknown>;
}

export class EgressPluginResultInterface {
  readonly data!: Record<string, unknown> | Array<Record<string, unknown>>;
  readonly meta?: Record<string, unknown>;
  readonly error?: Error;
}

export class EgressPluginInputInterface {
  readonly action!:
    | HTTPAction
    | BaseGrpcAction
    | BaseRedisAction
    | BaseMongodbAction
    | KafkaProduceAction
    | KafkaConsumerAction
    | undefined;

  readonly message!: MessageInterface;
}
