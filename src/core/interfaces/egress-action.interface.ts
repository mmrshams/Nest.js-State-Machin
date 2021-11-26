import {Method} from 'axios';
import * as joi from 'joiful';

export type TemplateType = 'XML' | 'JSON';

export class HTTPAction {
  @(joi.string().required())
  requestMethod!: Method;

  @(joi.string().required())
  urlTemplate!: string;

  @joi.string()
  headerTemplate?: string;

  @joi.string()
  bodyTemplate?: string;

  @(joi.string().allow(['JSON', 'XML']).required())
  parseAs!: TemplateType;

  //http timeout, default 0 (no timeout, axios default)
  @joi.number()
  timeout?: number;

  @joi.boolean()
  logRawResponse = false;

  // TODO: Add time to interactive timeout (timeout to first byte after header)
  // TODO: Add download timeout (timeout to last byte of data)
  // TODO: Add keep alive flag
  // TODO: Add proxy configurations
  // TODO: Add max redirects
  // TODO: Add max response body length
  // TODO: Add body from transformer key buffer(required for sending binary request)
}

export class BaseGrpcAction {}
export class BaseKafkaAction {}

export class GrpcAction extends BaseGrpcAction {
  @(joi.string().required())
  uri!: string;

  @(joi.string().required())
  method!: string;

  @(joi.string().required())
  dataKey!: string;
  // TODO: remove this option
  @(joi.object().optional())
  options?: {
    isSecure: boolean;
  };
}

export class BaseMongodbAction {
  @(joi.string().optional())
  db?: string;

  @(joi.string().required())
  collection!: string;
}

export class MongodbAggregateAction extends BaseMongodbAction {
  @(joi
    .array()
    .items(joi => joi.object())
    .required())
  query!: Array<Record<string, unknown>>;

  @(joi.string().optional())
  queryAddress?: string;
}

export class MongodbUpsertAction extends BaseMongodbAction {
  @(joi.object().required())
  query!: Record<string, unknown>;

  @(joi.string().optional())
  queryAddress?: string;

  @(joi.object().optional())
  value?: Record<string, unknown>;

  @(joi.string().optional())
  valueKey?: string;

  @(joi.boolean().optional())
  upsertMode?: boolean;
}
export class MongodbInsertAction extends BaseMongodbAction {
  @(joi.object().optional())
  value?: Record<string, unknown>;

  @(joi.string().optional())
  valueKey?: string;
}

export class MongodbAction {
  @(joi.object().optional())
  aggregate?: MongodbAggregateAction;

  @(joi.object().optional())
  upsert?: MongodbUpsertAction;

  @(joi.object().optional())
  insert?: MongodbInsertAction;
}

export class BaseRedisAction {
  @(joi.string().required())
  key!: string;
}

export class RedisSetAction extends BaseRedisAction {
  @(joi.string().optional())
  value?: string;

  @(joi.string().optional())
  valueFrom?: string;

  @(joi.string().optional())
  expiryMode?: string | unknown[];

  @(joi.string().optional())
  time?: number | string;

  @(joi.string().optional())
  setMode?: number | string;
}

export class RedisGetAction extends BaseRedisAction {}

export class RedisAction {
  @(joi.object().optional())
  get?: RedisGetAction;

  @(joi.object().optional())
  set?: RedisSetAction;
}

export class KafkaProduceAction {
  @(joi.string().required())
  topic!: string;

  @(joi.string().required())
  key!: string;
}

export class KafkaConsumerAction {
  @(joi.string().required())
  topic!: string;

  @(joi.string().required())
  key!: string;
}

export class KafkaAction extends BaseKafkaAction {
  produce!: KafkaProduceAction;
  consumer!: KafkaConsumerAction;
}

export class Egress {
  @(joi.object().optional())
  http?: HTTPAction;

  @(joi.object().optional())
  grpc?: GrpcAction;

  @(joi.object().optional())
  kafka?: KafkaAction;

  @(joi.object().optional())
  redis?: RedisAction;

  @(joi.object().optional())
  mongodb?: MongodbAction;
}
